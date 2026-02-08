(function() {
  'use strict';

  var visitorId = getOrCreateVisitorId();
  var conversationId = null;
  var isOpen = false;
  var isLoading = false;
  var messages = [];

  // Restore conversation from localStorage
  try {
    var stored = localStorage.getItem('vael_chat');
    if (stored) {
      var data = JSON.parse(stored);
      if (data.ts && Date.now() - data.ts < 24 * 60 * 60 * 1000) {
        conversationId = data.cid || null;
        messages = data.msgs || [];
      }
    }
  } catch(e) {}

  function getOrCreateVisitorId() {
    var key = 'vael_vid';
    var id = null;
    try { id = localStorage.getItem(key); } catch(e) {}
    if (!id) {
      id = 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      try { localStorage.setItem(key, id); } catch(e) {}
    }
    return id;
  }

  function saveConversation() {
    try {
      localStorage.setItem('vael_chat', JSON.stringify({
        cid: conversationId,
        msgs: messages.slice(-20),
        ts: Date.now()
      }));
    } catch(e) {}
  }

  // Inline SVG avatar — professional woman illustration
  var avatarSVG = '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="32" cy="32" r="32" fill="#E8E0F0"/>' +
    '<path d="M16 28c0-10 6-17 16-17s16 7 16 17c0 3-1 6-2 8l-1 2c0 4 2 7 3 9H16c1-2 3-5 3-9l-1-2c-1-2-2-5-2-8z" fill="#4A3728"/>' +
    '<ellipse cx="32" cy="30" rx="12" ry="13" fill="#F5D0B0"/>' +
    '<path d="M20 28c0-8 5-14 12-14s12 6 12 14c0 1 0 2-.5 3C43 25 38 22 32 22s-11 3-11.5 9c-.3-1-.5-2-.5-3z" fill="#4A3728"/>' +
    '<ellipse cx="27" cy="30" rx="1.8" ry="2" fill="#1C1C1E"/>' +
    '<ellipse cx="37" cy="30" rx="1.8" ry="2" fill="#1C1C1E"/>' +
    '<circle cx="27.6" cy="29.2" r="0.7" fill="white"/>' +
    '<circle cx="37.6" cy="29.2" r="0.7" fill="white"/>' +
    '<path d="M24 27c1-1.5 3-2 4.5-1.5" stroke="#3D2E1F" stroke-width="0.8" stroke-linecap="round" fill="none"/>' +
    '<path d="M35.5 25.5c1.5-.5 3.5 0 4.5 1.5" stroke="#3D2E1F" stroke-width="0.8" stroke-linecap="round" fill="none"/>' +
    '<path d="M31 31.5c.5 1.5 1 2 2 2" stroke="#D4A882" stroke-width="0.7" stroke-linecap="round" fill="none"/>' +
    '<path d="M28 36c1.5 2 6.5 2 8 0" stroke="#C4826E" stroke-width="1" stroke-linecap="round" fill="none"/>' +
    '<path d="M29.5 35.5c1 .3 4 .3 5 0" stroke="#D4908A" stroke-width="0.6" fill="none"/>' +
    '<rect x="29" y="42" width="6" height="5" rx="2" fill="#F5D0B0"/>' +
    '<path d="M18 58c0-8 6-13 14-13s14 5 14 13" fill="#007AFF"/>' +
    '<path d="M27 45l5 4 5-4" stroke="white" stroke-width="0.8" fill="none" stroke-linecap="round"/>' +
    '</svg>';

  function createAvatar(size) {
    var el = document.createElement('div');
    el.style.cssText = 'width:' + size + 'px;height:' + size + 'px;border-radius:50%;overflow:hidden;flex-shrink:0;background:#F2F2F7;';
    el.innerHTML = avatarSVG;
    el.querySelector('svg').style.cssText = 'width:100%;height:100%;display:block;';
    return el;
  }

  function createStyles() {
    var style = document.createElement('style');
    style.textContent = [
      // Bubble trigger
      '#vael-chat-bubble{position:fixed;bottom:20px;right:20px;width:60px;height:60px;border-radius:50%;background:#007AFF;color:#fff;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:9998;display:flex;align-items:center;justify-content:center;transition:transform 0.2s,box-shadow 0.2s}',
      '#vael-chat-bubble:hover{transform:scale(1.05);box-shadow:0 6px 16px rgba(0,0,0,0.2)}',
      '#vael-chat-bubble svg{width:28px;height:28px}',

      // Chat window
      '#vael-chat-window{position:fixed;bottom:90px;right:20px;width:380px;max-width:calc(100vw - 40px);height:550px;max-height:calc(100vh - 120px);background:#fff;border-radius:20px;box-shadow:0 8px 40px rgba(0,0,0,0.16);z-index:9999;display:none;flex-direction:column;overflow:hidden;font-family:-apple-system,"SF Pro",BlinkMacSystemFont,"Helvetica Neue",sans-serif;animation:vael-fade-in 0.25s ease-out}',
      '#vael-chat-window.open{display:flex}',

      // Header — clean white/light, iMessage style
      '#vael-chat-header{background:#FBFBFB;color:#1C1C1E;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;border-bottom:1px solid #E5E5EA}',
      '#vael-chat-header-left{display:flex;align-items:center;gap:10px}',
      '#vael-chat-header-avatar{position:relative;flex-shrink:0}',
      '#vael-chat-header-online{position:absolute;bottom:0;right:0;width:10px;height:10px;background:#34C759;border-radius:50%;border:2px solid #FBFBFB}',
      '#vael-chat-header-name{font-weight:600;font-size:15px;color:#1C1C1E}',
      '#vael-chat-header-status{font-size:12px;color:#8E8E93}',
      '#vael-chat-close{background:none;border:none;color:#8E8E93;cursor:pointer;font-size:20px;padding:4px;line-height:1;border-radius:50%;transition:background-color 0.15s;display:flex;align-items:center;justify-content:center;width:32px;height:32px}',
      '#vael-chat-close:hover{background:#F2F2F7}',

      // Messages area — iOS gray bg
      '#vael-chat-messages{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;background:#F2F2F7}',

      // Message rows
      '.vael-msg-row{display:flex;margin-top:2px}',
      '.vael-msg-row.new-group{margin-top:12px}',
      '.vael-msg-row.user{justify-content:flex-end;padding-left:48px}',
      '.vael-msg-row.assistant{align-items:flex-end;gap:6px;padding-right:48px}',
      '.vael-avatar-slot{width:28px;flex-shrink:0}',

      // Bubbles
      '.vael-bubble{max-width:85%;padding:9px 14px;font-size:15px;line-height:1.4;word-wrap:break-word;position:relative}',
      '.vael-bubble.user{background:#007AFF;color:#fff;border-radius:18px 18px 4px 18px}',
      '.vael-bubble.assistant{background:#E9E9EB;color:#1C1C1E;border-radius:18px 18px 18px 4px}',

      // Bubble tails
      '.vael-bubble.user::after{content:"";position:absolute;bottom:0;right:-6px;width:12px;height:12px;background:#007AFF;border-bottom-left-radius:12px;clip-path:polygon(0 0,0 100%,100% 100%)}',
      '.vael-bubble.assistant::after{content:"";position:absolute;bottom:0;left:-6px;width:12px;height:12px;background:#E9E9EB;border-bottom-right-radius:12px;clip-path:polygon(100% 0,0 100%,100% 100%)}',

      // Typing indicator
      '.vael-typing-row{display:flex;align-items:flex-end;gap:6px;margin-top:4px;margin-bottom:8px}',
      '.vael-typing-bubble{display:flex;align-items:center;gap:4px;padding:12px 16px;background:#E9E9EB;border-radius:18px 18px 18px 4px}',
      '.vael-typing-dot{width:8px;height:8px;border-radius:50%;background:#8E8E93;display:inline-block;animation:vael-dot-bounce 1.4s infinite ease-in-out both}',
      '.vael-typing-dot:nth-child(1){animation-delay:-0.32s}',
      '.vael-typing-dot:nth-child(2){animation-delay:-0.16s}',
      '.vael-typing-dot:nth-child(3){animation-delay:0s}',

      // Input area
      '#vael-chat-input-area{display:flex;align-items:center;padding:8px 12px 10px;border-top:1px solid #E5E5EA;gap:8px;flex-shrink:0;background:#FBFBFB}',
      '#vael-chat-input{flex:1;border:1px solid #C7C7CC;border-radius:20px;padding:10px 16px;font-size:15px;font-family:inherit;outline:none;resize:none;min-height:20px;max-height:80px;background:#fff;color:#1C1C1E;transition:border-color 0.15s,box-shadow 0.15s}',
      '#vael-chat-input:focus{border-color:#007AFF;box-shadow:0 0 0 1px rgba(0,122,255,0.2)}',
      '#vael-chat-input::placeholder{color:#8E8E93}',
      '#vael-chat-send{width:34px;height:34px;border-radius:50%;background:#C7C7CC;color:#fff;border:none;cursor:default;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:background 0.15s;padding:0}',
      '#vael-chat-send.active{background:#007AFF;cursor:pointer}',
      '#vael-chat-send svg{width:16px;height:16px}',

      // Welcome
      '.vael-welcome{text-align:center;color:#8E8E93;font-size:13px;padding:40px 20px;line-height:1.4}',
      '.vael-welcome-name{font-size:16px;font-weight:600;color:#1C1C1E;margin-bottom:4px}',

      // Error
      '.vael-error{padding:10px 14px;background:#fef2f2;color:#dc2626;border-radius:12px;font-size:13px;display:flex;align-items:center;justify-content:space-between;margin:8px 0}',
      '.vael-error button{background:none;border:none;color:#dc2626;cursor:pointer;font-size:16px;padding:0 2px}',

      // Animations
      '@keyframes vael-dot-bounce{0%,80%,100%{transform:scale(0);opacity:0.4}40%{transform:scale(1);opacity:1}}',
      '@keyframes vael-fade-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}',
      '@keyframes vael-spin{to{transform:rotate(360deg)}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function createWidget() {
    // Floating bubble button
    var bubble = document.createElement('button');
    bubble.id = 'vael-chat-bubble';
    bubble.setAttribute('aria-label', 'Open chat');
    bubble.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    bubble.addEventListener('click', toggleChat);

    // Chat window
    var win = document.createElement('div');
    win.id = 'vael-chat-window';

    // Header
    var header = document.createElement('div');
    header.id = 'vael-chat-header';

    var headerLeft = document.createElement('div');
    headerLeft.id = 'vael-chat-header-left';

    var avatarWrap = document.createElement('div');
    avatarWrap.id = 'vael-chat-header-avatar';
    avatarWrap.appendChild(createAvatar(36));
    var onlineDot = document.createElement('div');
    onlineDot.id = 'vael-chat-header-online';
    avatarWrap.appendChild(onlineDot);
    headerLeft.appendChild(avatarWrap);

    var headerText = document.createElement('div');
    var nameEl = document.createElement('div');
    nameEl.id = 'vael-chat-header-name';
    nameEl.textContent = 'Vael Creative';
    var statusEl = document.createElement('div');
    statusEl.id = 'vael-chat-header-status';
    statusEl.textContent = 'Online';
    headerText.appendChild(nameEl);
    headerText.appendChild(statusEl);
    headerLeft.appendChild(headerText);
    header.appendChild(headerLeft);

    var closeBtn = document.createElement('button');
    closeBtn.id = 'vael-chat-close';
    closeBtn.setAttribute('aria-label', 'Close chat');
    closeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    closeBtn.addEventListener('click', toggleChat);
    header.appendChild(closeBtn);

    win.appendChild(header);

    // Messages container
    var msgContainer = document.createElement('div');
    msgContainer.id = 'vael-chat-messages';
    win.appendChild(msgContainer);

    // Input area
    var inputArea = document.createElement('div');
    inputArea.id = 'vael-chat-input-area';

    var input = document.createElement('textarea');
    input.id = 'vael-chat-input';
    input.placeholder = 'iMessage';
    input.rows = 1;
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    input.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 80) + 'px';
      updateSendButton();
    });
    inputArea.appendChild(input);

    var sendBtn = document.createElement('button');
    sendBtn.id = 'vael-chat-send';
    sendBtn.setAttribute('aria-label', 'Send message');
    sendBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="white"><path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a.993.993 0 00-1.39.91L2 9.12c0 .5.37.93.87.99L13 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z"/></svg>';
    sendBtn.addEventListener('click', sendMessage);
    inputArea.appendChild(sendBtn);

    win.appendChild(inputArea);

    document.body.appendChild(bubble);
    document.body.appendChild(win);

    renderMessages();
  }

  function updateSendButton() {
    var input = document.getElementById('vael-chat-input');
    var sendBtn = document.getElementById('vael-chat-send');
    if (!input || !sendBtn) return;
    if (input.value.trim() && !isLoading) {
      sendBtn.classList.add('active');
    } else {
      sendBtn.classList.remove('active');
    }
  }

  function toggleChat() {
    isOpen = !isOpen;
    var win = document.getElementById('vael-chat-window');
    if (isOpen) {
      win.classList.add('open');
      setTimeout(function() { document.getElementById('vael-chat-input').focus(); }, 100);
      scrollToBottom();
    } else {
      win.classList.remove('open');
    }
  }

  function renderMessages() {
    var container = document.getElementById('vael-chat-messages');
    if (!container) return;
    container.innerHTML = '';

    if (messages.length === 0) {
      var welcome = document.createElement('div');
      welcome.className = 'vael-welcome';
      welcome.appendChild(createAvatar(56));
      welcome.lastChild.style.margin = '0 auto 16px';
      var wName = document.createElement('div');
      wName.className = 'vael-welcome-name';
      wName.textContent = 'Vael Creative';
      welcome.appendChild(wName);
      var wText = document.createElement('div');
      wText.textContent = 'Ask us anything about our services, pricing, or how we can help your brand.';
      welcome.appendChild(wText);
      container.appendChild(welcome);
    }

    for (var i = 0; i < messages.length; i++) {
      var msg = messages[i];
      var prev = i > 0 ? messages[i - 1] : null;
      var sameSender = prev && prev.role === msg.role;

      var row = document.createElement('div');
      row.className = 'vael-msg-row ' + msg.role;
      if (!sameSender) row.classList.add('new-group');

      if (msg.role === 'assistant') {
        // Avatar slot
        var avatarSlot = document.createElement('div');
        avatarSlot.className = 'vael-avatar-slot';
        if (!sameSender) {
          avatarSlot.appendChild(createAvatar(28));
        }
        row.appendChild(avatarSlot);
      }

      var bubble = document.createElement('div');
      bubble.className = 'vael-bubble ' + msg.role;
      bubble.textContent = msg.content;
      row.appendChild(bubble);

      container.appendChild(row);
    }

    if (isLoading) {
      var typingRow = document.createElement('div');
      typingRow.className = 'vael-typing-row';
      typingRow.appendChild(createAvatar(28));
      var typingBubble = document.createElement('div');
      typingBubble.className = 'vael-typing-bubble';
      for (var d = 0; d < 3; d++) {
        var dot = document.createElement('span');
        dot.className = 'vael-typing-dot';
        typingBubble.appendChild(dot);
      }
      typingRow.appendChild(typingBubble);
      container.appendChild(typingRow);
    }

    scrollToBottom();
    updateSendButton();
  }

  function scrollToBottom() {
    var container = document.getElementById('vael-chat-messages');
    if (container) {
      setTimeout(function() { container.scrollTop = container.scrollHeight; }, 50);
    }
  }

  function sendMessage() {
    var input = document.getElementById('vael-chat-input');
    var text = input.value.trim();
    if (!text || isLoading) return;

    input.value = '';
    input.style.height = 'auto';

    messages.push({ role: 'user', content: text, timestamp: Date.now() });
    isLoading = true;
    renderMessages();

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId: visitorId,
        message: text,
        conversationId: conversationId || undefined,
        currentPage: window.location.pathname
      })
    })
    .then(function(res) {
      if (!res.ok) throw new Error('Chat request failed');
      return res.json();
    })
    .then(function(data) {
      conversationId = data.conversationId;
      messages.push({
        role: 'assistant',
        content: data.message.content,
        timestamp: data.message.timestamp
      });
      saveConversation();
    })
    .catch(function(err) {
      console.error('Vael chat error:', err);
      messages.push({
        role: 'assistant',
        content: "I\u2019m sorry, I had trouble responding. Please try again.",
        timestamp: Date.now()
      });
    })
    .finally(function() {
      isLoading = false;
      renderMessages();
      document.getElementById('vael-chat-input').focus();
    });
  }

  function init() {
    createStyles();
    createWidget();
    fetch('/api/visitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: visitorId })
    }).catch(function() {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
