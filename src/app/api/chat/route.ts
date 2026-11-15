import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import {
  buildChatFallbackReply,
  getChatRolePreset,
  type ChatRoleId,
  type GeminiChatModelId,
} from '@/lib/chat-roles';

interface IncomingHistoryItem {
  role: 'user' | 'model';
  text: string;
}

export async function POST(req: NextRequest) {
  let message = '';
  let roleId: ChatRoleId = 'trial_report_coach';
  let modelId: GeminiChatModelId = 'gemini-4-hydrogen';
  let history: IncomingHistoryItem[] = [];
  let contextSummary = '';

  try {
    const body = await req.json();
    message = typeof body?.message === 'string' ? body.message.trim() : '';
    roleId =
      body?.roleId === 'parent_advisor' || body?.roleId === 'quick_assistant'
        ? body.roleId
        : 'trial_report_coach';
    modelId =
      body?.modelId === 'gemini-3.1-flash-lite'
        ? 'gemini-3.1-flash-lite'
        : 'gemini-4-hydrogen';
    contextSummary =
      typeof body?.contextSummary === 'string' ? body.contextSummary : '';
    if (Array.isArray(body?.history)) {
      history = body.history
        .filter(
          (item: unknown): item is IncomingHistoryItem =>
            typeof item === 'object' &&
            item !== null &&
            ((item as IncomingHistoryItem).role === 'user' ||
              (item as IncomingHistoryItem).role === 'model') &&
            typeof (item as IncomingHistoryItem).text === 'string'
        )
        .slice(-20);
    }
  } catch {
    return NextResponse.json(
      { error: 'Nội dung chat không hợp lệ.' },
      { status: 400 }
    );
  }

  if (!message) {
    return NextResponse.json(
      { error: 'Vui lòng nhập nội dung câu hỏi.' },
      { status: 400 }
    );
  }

  const preset = getChatRolePreset(roleId);
  const fallbackReply = buildChatFallbackReply(
    message,
    roleId,
    history,
    contextSummary
  );

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      source: 'local',
      modelUsed: modelId,
      reply: fallbackReply,
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = contextSummary.trim()
      ? `${preset.systemInstruction}\n\nNgữ cảnh học sinh / báo cáo hiện tại: ${contextSummary.trim()}`
      : preset.systemInstruction;

    const chat = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction,
      },
      history: history.map((item) => ({
        role: item.role,
        parts: [{ text: item.text }],
      })),
    });

    const response = await chat.sendMessage({ message });
    const text = response.text?.trim();

    return NextResponse.json({
      source: 'gemini',
      modelUsed: modelId,
      reply: text || fallbackReply,
    });
  } catch {
    return NextResponse.json({
      source: 'local',
      modelUsed: modelId,
      reply: fallbackReply,
    });
  }
}
