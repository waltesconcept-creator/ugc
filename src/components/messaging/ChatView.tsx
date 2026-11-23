'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Conversation, Message } from '@/lib/types';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from '@/lib/mock-data';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Image,
  MoreVertical,
  Search,
  Phone,
  Video,
  BadgeCheck,
  FileText,
  ChevronRight,
  X,
  Smile,
} from 'lucide-react';

interface ChatViewProps {
  onOpenProject?: (bookingId: string) => void;
  activeCreatorId?: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const ChatView: React.FC<ChatViewProps> = ({ onOpenProject, activeCreatorId }) => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [localMessages, setLocalMessages] = useState<Record<string, Message[]>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-select conversation if activeCreatorId is provided
  useEffect(() => {
    if (activeCreatorId) {
      const conv = MOCK_CONVERSATIONS.find((c) => c.participantId === activeCreatorId);
      if (conv) setSelectedConversation(conv);
    }
  }, [activeCreatorId]);

  // Get messages for selected conversation
  const currentMessages = useMemo(() => {
    if (!selectedConversation) return [];
    const mock = MOCK_MESSAGES[selectedConversation.id] || [];
    const local = localMessages[selectedConversation.id] || [];
    return [...mock, ...local];
  }, [selectedConversation, localMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  // Focus input when conversation selected
  useEffect(() => {
    if (selectedConversation) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [selectedConversation]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_CONVERSATIONS;
    const q = searchQuery.toLowerCase();
    return MOCK_CONVERSATIONS.filter(
      (c) =>
        c.participantName.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSend = () => {
    if (!messageInput.trim() || !selectedConversation) return;
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: 'current_user',
      senderName: 'You',
      senderAvatar: '',
      content: messageInput.trim(),
      isRead: true,
      createdAt: new Date().toISOString(),
    };
    setLocalMessages((prev) => ({
      ...prev,
      [selectedConversation.id]: [...(prev[selectedConversation.id] || []), newMsg],
    }));
    setMessageInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Conversation list ──
  const ConversationList = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-neutral-800/50">
        <h2 className="text-lg font-bold text-white mb-3">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#0095f6] transition-colors"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-neutral-500">No conversations found</p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-900/80 transition-colors border-b border-neutral-800/30 min-h-[64px] ${
                selectedConversation?.id === conv.id ? 'bg-neutral-900/80' : ''
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={conv.participantAvatar}
                  alt={conv.participantName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {/* Online indicator */}
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-neutral-950" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-white truncate">{conv.participantName}</span>
                  <span className="text-[10px] text-neutral-500 shrink-0">{timeAgo(conv.lastMessageTime)}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="text-xs text-neutral-400 truncate">{conv.lastMessage}</p>
                  {conv.unreadCount > 0 && (
                    <span className="shrink-0 min-w-[20px] h-5 flex items-center justify-center rounded-full bg-[#0095f6] text-[10px] font-bold text-white px-1">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  // ── Active chat ──
  const ActiveChat = () => {
    if (!selectedConversation) return null;

    return (
      <div className="flex flex-col h-full">
        {/* Chat header */}
        <div className="shrink-0 flex items-center gap-3 px-3 sm:px-4 py-3 border-b border-neutral-800/50 bg-neutral-950/95 backdrop-blur-md">
          {/* Back button (mobile) */}
          <button
            onClick={() => setSelectedConversation(null)}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-neutral-800 transition-colors min-w-[44px] min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <img
            src={selectedConversation.participantAvatar}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{selectedConversation.participantName}</h3>
            <span className="text-[11px] text-emerald-400">Online</span>
          </div>
          <div className="flex items-center gap-1">
            {selectedConversation.bookingContextId && onOpenProject && (
              <button
                onClick={() => onOpenProject(selectedConversation.bookingContextId!)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-neutral-800 text-[11px] text-neutral-300 hover:bg-neutral-700 transition-colors min-h-[36px]"
              >
                <FileText className="w-3 h-3" />
                <span className="hidden sm:inline">Project</span>
              </button>
            )}
            <button className="w-10 h-10 rounded-full hover:bg-neutral-800 flex items-center justify-center transition-colors min-w-[44px] min-h-[44px]">
              <MoreVertical className="w-4 h-4 text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-3">
          {currentMessages.map((msg, idx) => {
            const isMe = msg.senderId === 'current_user';
            const showAvatar = !isMe && (idx === 0 || currentMessages[idx - 1]?.senderId !== msg.senderId);

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                {!isMe && (
                  <div className="w-7 shrink-0">
                    {showAvatar ? (
                      <img
                        src={msg.senderAvatar}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : null}
                  </div>
                )}

                <div className={`max-w-[75%] sm:max-w-[65%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div
                    className={`px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      isMe
                        ? 'bg-[#0095f6] text-white rounded-2xl rounded-br-sm'
                        : 'bg-[#262626] text-white rounded-2xl rounded-bl-sm border border-[#333333]'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Attachment */}
                  {msg.attachmentUrl && (
                    <div className="mt-1 rounded-xl overflow-hidden border border-neutral-700/50 max-w-[200px]">
                      <img src={msg.attachmentUrl} alt="Attachment" className="w-full object-cover" />
                    </div>
                  )}

                  <span className="text-[9px] text-neutral-600 mt-1 px-1">
                    {timeAgo(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="shrink-0 border-t border-neutral-800/50 bg-neutral-950/95 backdrop-blur-md px-3 sm:px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-end gap-2">
            <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-neutral-800 transition-colors min-w-[44px] min-h-[44px]">
              <Paperclip className="w-4 h-4 text-neutral-400" />
            </button>
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-2xl text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#0095f6] transition-colors pr-10 min-h-[44px]"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2">
                <Smile className="w-4 h-4 text-neutral-500" />
              </button>
            </div>
            <button
              onClick={handleSend}
              disabled={!messageInput.trim()}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0095f6] hover:bg-[#1877f2] text-white disabled:opacity-40 transition-colors min-w-[44px] min-h-[44px]"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100dvh-3.5rem-4rem)] lg:h-[calc(100vh-3.5rem)] bg-neutral-950">
      {/* Desktop: side-by-side */}
      <div className="hidden lg:grid lg:grid-cols-[360px_1fr] h-full max-w-6xl mx-auto border-x border-neutral-800/50">
        <div className="border-r border-neutral-800/50 overflow-hidden">
          <ConversationList />
        </div>
        <div className="overflow-hidden">
          {selectedConversation ? (
            <ActiveChat />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4">
                <Send className="w-7 h-7 text-neutral-700" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Your Messages</h3>
              <p className="text-sm text-neutral-500">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: show list OR chat */}
      <div className="lg:hidden h-full">
        {selectedConversation ? (
          <ActiveChat />
        ) : (
          <ConversationList />
        )}
      </div>
    </div>
  );
};

export { ChatView };
export default ChatView;
