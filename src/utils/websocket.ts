class WebSocketManager {
  ws: WebSocket | null = null;
  readerId: number | null = null;
  reconnectTimer: any = null;
  heartbeatTimer: any = null;
  reconnectAttempts = 0;
  maxReconnectAttempts = 5;

  /**
   * 建立 WebSocket 连接
   * @param readerId - 读者ID
   */
  connect(readerId: number) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket 已连接');
      return;
    }

    this.readerId = readerId;
    const wsUrl = `ws://localhost:8080/ws/reader/${readerId}`;
    
    console.log('正在建立 WebSocket 连接...', wsUrl);
    console.log('WebSocket 状态:', this.ws ? this.ws.readyState : 'null');
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket 连接成功，当前状态:', this.ws?.readyState);
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      console.log('WebSocket 接收到原始消息:', event.data);
      this.handleMessage(event.data);
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket 连接关闭，代码:', event.code, '原因:', event.reason);
      this.stopHeartbeat();
      this.reconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket 错误:', error);
    };
  }

  /**
   * 处理接收到的消息
   * @param data - 消息数据
   */
  handleMessage(data: string) {
    try {
      const message = JSON.parse(data);
      console.log('收到 WebSocket 消息:', message);

      switch (message.type) {
        case 'reserve_notify':
          this.handleReserveNotify(message);
          break;
        default:
          console.log('未知消息类型:', message.type);
      }
    } catch (error) {
      console.error('消息解析失败:', error, data);
    }
  }

  /**
   * 处理预约到馆通知
   * @param message - 消息内容
   */
  handleReserveNotify(message: any) {
    console.log('预约到馆提醒:', message);
    
    // 显示浏览器通知
    this.showNotification(message);

    // 触发全局事件，通知其他组件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('reserve-notify', { 
        detail: message 
      }));
    }

    // 更新 Vuex 中的未读消息数
    const app = (window as any).__app__;
    if (app && app.$store) {
      app.$store.dispatch('reader/incrementUnreadNoticeCount');
    }
  }

  /**
   * 显示桌面通知
   * @param message - 消息内容
   */
  showNotification(message: any) {
    // 检查浏览器是否支持通知
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        this.sendDesktopNotification(message);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            this.sendDesktopNotification(message);
          }
        });
      }
    }
  }

  /**
   * 发送桌面通知
   * @param message - 消息内容
   */
  sendDesktopNotification(message: any) {
    const notification = new Notification(' 预约到馆提醒', {
      body: `您预约的《${message.bookName}》现已到馆，请在 ${message.deadline} 前到馆完成借阅！`,
      icon: '/favicon.ico',
      tag: `reserve-${message.reserveId}`
    });

    notification.onclick = () => {
      window.focus();
      // 跳转到预约页面
      const router = (window as any).__router__;
      if (router) {
        router.push('/reader/reserve');
      }
      notification.close();
    };
  }

  /**
   * 断线重连
   */
  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('达到最大重连次数，停止重连');
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`${delay}ms 后尝试第 ${this.reconnectAttempts} 次重连...`);
    
    this.reconnectTimer = setTimeout(() => {
      console.log('正在重连...');
      if (this.readerId !== null) {
        this.connect(this.readerId);
      }
    }, delay);
  }

  /**
   * 心跳检测
   */
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // 每30秒发送一次心跳
  }

  /**
   * 停止心跳
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * 关闭连接
   */
  close() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.readerId = null;
  }

  /**
   * 获取连接状态
   * @returns 连接是否处于打开状态
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * 测试 WebSocket 连接（手动发送测试消息）
   */
  testConnection() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('正在发送测试消息...');
      // 模拟后端发送的消息
      const testMessage = JSON.stringify({
        type: 'reserve_notify',
        bookName: '测试图书',
        deadline: '2024-12-31 23:59:59',
        reserveId: 999,
        noticeId: 888
      });
      this.handleMessage(testMessage);
      console.log('测试消息已发送（本地模拟）');
    } else {
      console.error('WebSocket 未连接，无法测试');
    }
  }
}

// 导出单例
export default new WebSocketManager();
