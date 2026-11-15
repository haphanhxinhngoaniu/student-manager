'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Bot, Check, Copy, Send, Trash2, User } from 'lucide-react';
import {
  CHAT_ROLES,
  createChatMessage,
  EMPTY_CHAT_THREADS,
  getChatRolePreset,
  type ChatMessage,
  type ChatRoleId,
  type GeminiChatModelId,
} from '@/lib/chat-roles';

export interface GeminiChatPanelProps {
  contextSummary?: string;
  compact?: boolean;
  onApplyReplyToNote?: (text: string) => void;
}

const CHAT_STORAGE_KEY = 'student-manager:gemini-chat-history:v1';

type ChatThreads = Record<ChatRoleId, ChatMessage[]>;

let cachedThreads: ChatThreads | null = null;
const chatListeners = new Set<() => void>();

function readThreadsFromStorage(): ChatThreads {
  if (typeof window === 'undefined') return EMPTY_CHAT_THREADS;
  if (cachedThreads) return cachedThreads;
  try {
    const saved = window.localStorage.getItem(CHAT_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<ChatThreads>;
      if (parsed && typeof parsed === 'object') {
        cachedThreads = {
          trial_report_coach: Array.isArray(parsed.trial_report_coach)
            ? parsed.trial_report_coach
            : [],
          parent_advisor: Array.isArray(parsed.parent_advisor)
            ? parsed.parent_advisor
            : [],
          quick_assistant: Array.isArray(parsed.quick_assistant)
            ? parsed.quick_assistant
            : [],
        };
        return cachedThreads;
      }
    }
  } catch {
    // Ignore storage parse failure
  }
  cachedThreads = EMPTY_CHAT_THREADS;
  return cachedThreads;
}

function writeThreadsToStorage(next: ChatThreads) {
  cachedThreads = next;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore quota error
    }
  }
  chatListeners.forEach((listener) => listener());
}

function subscribeChatStore(listener: () => void) {
  chatListeners.add(listener);
  return () => {
    chatListeners.delete(listener);
  };
}

function getChatServerSnapshot(): ChatThreads {
  return EMPTY_CHAT_THREADS;
}

export default function GeminiChatPanel({
  contextSummary = '',
  compact = false,
  onApplyReplyToNote,
}: GeminiChatPanelProps) {
  const [roleId, setRoleId] = useState<ChatRoleId>('trial_report_coach');
  const [modelId, setModelId] = useState<GeminiChatModelId>('gemini-4-hydrogen');
  const messagesByRole = useSyncExternalStore(
    subscribeChatStore,
    readThreadsFromStorage,
    getChatServerSnapshot
  );
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollEndRef = useRef<HTMLDivElement | null>(null);

  const activePreset = getChatRolePreset(roleId);
  const activeMessages = messagesByRole[roleId] ?? [];

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeMessages.length, roleId]);

  const handleSelectRole = (nextRole: ChatRoleId) => {
    setRoleId(nextRole);
    setModelId(getChatRolePreset(nextRole).recommendedModel);
  };

  const handleSendMessage = async (textOverride?: string) => {
    const cleanText = (textOverride ?? inputValue).trim();
    if (!cleanText || sending) return;

    const userMsg = createChatMessage('user', cleanText);
    const currentThread = messagesByRole[roleId] ?? [];
    const updatedWithUser: ChatThreads = {
      ...messagesByRole,
      [roleId]: [...currentThread, userMsg],
    };
    writeThreadsToStorage(updatedWithUser);
    if (!textOverride) setInputValue('');
    setSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanText,
          roleId,
          modelId,
          contextSummary,
          history: currentThread.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = (await res.json()) as {
        reply?: string;
        modelUsed?: GeminiChatModelId;
      };

      const replyText =
        data.reply?.trim() ||
        'Cô đã ghi nhận nội dung. Vui lòng thử gửi lại để trợ lý tiếp tục hỗ trợ.';

      const botMsg = createChatMessage(
        'model',
        replyText,
        data.modelUsed ?? modelId
      );

      writeThreadsToStorage({
        ...updatedWithUser,
        [roleId]: [...updatedWithUser[roleId], botMsg],
      });
    } catch {
      const errMsg = createChatMessage(
        'model',
        'Kết nối tạm gián đoạn, vui lòng thử gửi lại tin nhắn.'
      );
      writeThreadsToStorage({
        ...updatedWithUser,
        [roleId]: [...updatedWithUser[roleId], errMsg],
      });
    } finally {
      setSending(false);
    }
  };

  const handleCopyMessage = async (msg: ChatMessage) => {
    await navigator.clipboard.writeText(msg.text);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleClearThread = () => {
    writeThreadsToStorage({
      ...messagesByRole,
      [roleId]: [],
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col">
      {/* Role & Model Controls */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <h2
              className="text-sm font-semibold text-slate-900"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Trợ lý Sư phạm Gemini (Đa lượt)
            </h2>
            <p className="text-xs text-slate-500 truncate">
              {activePreset.shortDesc}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <select
              aria-label="Chọn mô hình Gemini"
              value={modelId}
              onChange={(e) => setModelId(e.target.value as GeminiChatModelId)}
              className="px-2 py-1 text-xs bg-white border border-slate-300 rounded-md"
            >
              <option value="gemini-4-hydrogen">Gemini 4 Flash (Chuẩn)</option>
              <option value="gemini-3.1-flash-lite">Gemini Flash Lite (Nhanh)</option>
            </select>
            {activeMessages.length > 0 && (
              <button
                type="button"
                onClick={handleClearThread}
                aria-label="Xóa lịch sử trò chuyện"
                className="p-1.5 text-slate-500 hover:text-rose-700 bg-white border border-slate-300 rounded-md"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div
          role="group"
          aria-label="Chọn vai trò trợ lý"
          className="grid grid-cols-1 sm:grid-cols-3 gap-1 p-1 bg-slate-200/70 rounded-md"
        >
          {CHAT_ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => handleSelectRole(r.id)}
              className={`px-2 py-1.5 text-xs font-medium rounded transition-colors text-left sm:text-center truncate ${
                roleId === r.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Thread */}
      <div
        className={`p-4 overflow-y-auto space-y-3 bg-white ${
          compact ? 'h-80' : 'h-[440px]'
        }`}
      >
        {activeMessages.length === 0 ? (
          <div className="space-y-3 py-2">
            <p className="text-xs text-slate-600">
              Chọn gợi ý nhanh hoặc nhập câu hỏi để trao đổi liên tục theo ngữ cảnh:
            </p>
            <div className="space-y-1.5">
              {activePreset.starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-900 border border-slate-200 rounded-md transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          activeMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'model' && (
                <div className="w-7 h-7 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-blue-700" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed space-y-2 ${
                  msg.role === 'user'
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-50 border border-slate-200 text-slate-800'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
                {msg.role === 'model' && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/80 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(msg)}
                      className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-700" />
                          Đã copy
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy câu trả lời
                        </>
                      )}
                    </button>
                    {onApplyReplyToNote && (
                      <button
                        type="button"
                        onClick={() => onApplyReplyToNote(msg.text)}
                        className="text-blue-700 hover:text-blue-900 font-medium"
                      >
                        Đưa vào ghi chú báo cáo
                      </button>
                    )}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-slate-700" />
                </div>
              )}
            </div>
          ))
        )}
        {sending && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Bot className="w-4 h-4 text-blue-700" />
            <span>Trợ lý đang soạn câu trả lời...</span>
          </div>
        )}
        <div ref={scrollEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSendMessage();
        }}
        className="p-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2"
      >
        <input
          type="text"
          aria-label="Nhập câu hỏi gửi trợ lý Gemini"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Nhập yêu cầu chỉnh câu nhận xét, gợi ý lộ trình..."
          className="flex-1 min-w-0 px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          type="submit"
          disabled={sending || !inputValue.trim()}
          aria-label="Gửi tin nhắn"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 disabled:opacity-50 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          Gửi
        </button>
      </form>
    </div>
  );
}
