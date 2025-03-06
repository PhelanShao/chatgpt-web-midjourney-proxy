import { defineStore } from 'pinia'
import { defaultState, getLocalState, setLocalState } from './helper'
import { router } from '@/router'
import { homeStore } from '@/store/homeStore'
import { sleep } from '@/api/suno'
import { mlog } from '@/api'
import {
  createConversation,
  updateConversationTitle,
  deleteConversation,
  getUserConversations,
  getConversationMessages,
  addMessageToConversation,
  deleteMessage,
  clearConversationMessages
} from '@/api/conversation'

// 注意：_id属性已经在chat.d.ts文件中定义

export const useChatStore = defineStore('chat-store', {
  state: (): Chat.ChatState => getLocalState(),

  getters: {
    getChatHistoryByCurrentActive(state: Chat.ChatState) {
      const index = state.history.findIndex(item => item.uuid === state.active)
      if (index !== -1)
        return state.history[index]
      return null
    },

    getChatByUuid(state: Chat.ChatState) {
      return (uuid?: number) => {
        if (uuid)
          return state.chat.find(item => item.uuid === uuid)?.data ?? []
        return state.chat.find(item => item.uuid === state.active)?.data ?? []
      }
    },
  },

  actions: {
    setUsingContext(context: boolean) {
      this.usingContext = context
      this.recordState()
    },

    addHistory(history: Chat.History, chatData: Chat.Chat[] = []) {
      this.history.unshift(history)
      this.chat.unshift({ uuid: history.uuid, data: chatData })
      this.active = history.uuid
      this.reloadRoute(history.uuid)
      
      // 保存到后端数据库，传递uuid作为会话ID
      this.saveConversationToServer(history.uuid.toString(), history.title);
    },

    updateHistory(uuid: number, edit: Partial<Chat.History>) {
      const index = this.history.findIndex(item => item.uuid === uuid)
      if (index !== -1) {
        this.history[index] = { ...this.history[index], ...edit }
        this.recordState()
        
        // 更新后端数据库中的会话标题
        if (edit.title) {
          this.updateConversationTitleOnServer(uuid.toString(), edit.title);
        }
      }
    },

    async deleteHistory(index: number) {
      const uuidToDelete = this.history[index]?.uuid;
      
      this.history.splice(index, 1)
      this.chat.splice(index, 1)

      // 从后端数据库中删除会话
      if (uuidToDelete) {
        this.deleteConversationFromServer(uuidToDelete.toString());
      }

      if (this.history.length === 0) {
        this.active = null
        this.reloadRoute()
        return
      }

      if (index > 0 && index <= this.history.length) {
        const uuid = this.history[index - 1].uuid
        this.active = uuid
        this.reloadRoute(uuid)
        return
      }

      if (index === 0) {
        if (this.history.length > 0) {
          const uuid = this.history[0].uuid
          this.active = uuid
          this.reloadRoute(uuid)
        }
      }

      if (index > this.history.length) {
        const uuid = this.history[this.history.length - 1].uuid
        this.active = uuid
        this.reloadRoute(uuid)
      }
    },

    async setActive(uuid: number) {
      this.active = uuid
      return await this.reloadRoute(uuid)
    },

    getChatByUuidAndIndex(uuid: number, index: number) {
      if (!uuid || uuid === 0) {
        if (this.chat.length)
          return this.chat[0].data[index]
        return null
      }
      const chatIndex = this.chat.findIndex(item => item.uuid === uuid)
      if (chatIndex !== -1)
        return this.chat[chatIndex].data[index]
      return null
    },

    addChatByUuid(uuid: number, chat: Chat.Chat) {
      if (!uuid || uuid === 0) {
        if (this.history.length === 0) {
          const uuid = Date.now()
          this.history.push({ uuid, title: chat.text, isEdit: false })
          this.chat.push({ uuid, data: [chat] })
          this.active = uuid
          this.recordState()
          
          // 保存到后端数据库
          this.saveConversationToServer(uuid, chat.text);
        }
        else {
          this.chat[0].data.push(chat)
          if (this.history[0].title === 'New Chat')
            this.history[0].title = chat.text
          this.recordState()
          
          // 保存消息到后端数据库
          this.saveMessageToServer(this.history[0].uuid.toString(), chat);
          
          // 如果标题是"New Chat"，更新后端数据库中的会话标题
          if (this.history[0].title === chat.text) {
            this.updateConversationTitleOnServer(this.history[0].uuid.toString(), chat.text);
          }
        }
      }

      const index = this.chat.findIndex(item => item.uuid === uuid)
      if (index !== -1) {
        this.chat[index].data.push(chat)
        if (this.history[index].title === 'New Chat')
          this.history[index].title = chat.text
        this.recordState()
        
        // 保存消息到后端数据库
        this.saveMessageToServer(uuid.toString(), chat);
        
        // 如果标题是"New Chat"，更新后端数据库中的会话标题
        if (this.history[index].title === chat.text) {
          this.updateConversationTitleOnServer(uuid.toString(), chat.text);
        }
      }
    },

    updateChatByUuid(uuid: number, index: number, chat: Chat.Chat) {
      if (!uuid || uuid === 0) {
        if (this.chat.length) {
          this.chat[0].data[index] = chat
          this.recordState()
        }
        return
      }

      const chatIndex = this.chat.findIndex(item => item.uuid === uuid)
      if (chatIndex !== -1) {
        this.chat[chatIndex].data[index] = chat
        this.recordState()
      }
    },

    updateChatSomeByUuid(uuid: number, index: number, chat: Partial<Chat.Chat>) {
      if (!uuid || uuid === 0) {
        if (this.chat.length) {
          this.chat[0].data[index] = { ...this.chat[0].data[index], ...chat }
          this.recordState()
        }
        return
      }

      const chatIndex = this.chat.findIndex(item => item.uuid === uuid)
      if (chatIndex !== -1) {
        this.chat[chatIndex].data[index] = { ...this.chat[chatIndex].data[index], ...chat }
        this.recordState()
      }
    },

    deleteChatByUuid(uuid: number, index: number) {
      if (!uuid || uuid === 0) {
        if (this.chat.length) {
          // 获取要删除的消息ID
          const messageToDelete = this.chat[0].data[index];
          
          this.chat[0].data.splice(index, 1)
          this.recordState()
          
          // 从后端数据库中删除消息
          if (messageToDelete && messageToDelete._id) {
            this.deleteMessageFromServer(messageToDelete._id);
          }
        }
        return
      }

      const chatIndex = this.chat.findIndex(item => item.uuid === uuid)
      if (chatIndex !== -1) {
        // 获取要删除的消息ID
        const messageToDelete = this.chat[chatIndex].data[index];
        
        this.chat[chatIndex].data.splice(index, 1)
        this.recordState()
        
        // 从后端数据库中删除消息
        if (messageToDelete && messageToDelete._id) {
          this.deleteMessageFromServer(messageToDelete._id);
        }
      }
    },

    clearChatByUuid(uuid: number) {
      if (!uuid || uuid === 0) {
        if (this.chat.length) {
          this.chat[0].data = []
          this.recordState()
          
          // 从后端数据库中清空会话消息
          this.clearConversationMessagesOnServer(this.history[0].uuid.toString());
        }
        return
      }

      const index = this.chat.findIndex(item => item.uuid === uuid)
      if (index !== -1) {
        this.chat[index].data = []
        this.recordState()
        
        // 从后端数据库中清空会话消息
        this.clearConversationMessagesOnServer(uuid.toString());
      }

      //清空标题
      const i2= this.history.findIndex( v=>v.uuid===uuid )
      if (i2 !== -1) {
        this.history[i2].title= "New Chat"
        this.recordState()
        
        // 更新后端数据库中的会话标题
        this.updateConversationTitleOnServer(uuid.toString(), "New Chat");
      }
      //end 清空标题
    },

    clearHistory() {
      // 清空所有会话前，先从后端数据库中删除所有会话
      this.history.forEach(history => {
        this.deleteConversationFromServer(history.uuid.toString());
      });
      
      this.$state = { ...defaultState() }
      this.recordState()
    },

    async reloadRoute(uuid?: number) {
      this.recordState();
      mlog('toMyuid19','reloadRoute')
      //await sleep(1000)
      await router.push({ name: homeStore.myData.local=='draw'?'draw': 'Chat', params: { uuid } })
    },

    recordState() {
      setLocalState(this.$state)
    },
    
    // 与后端API交互的方法
    
    // 保存会话到后端数据库
    async saveConversationToServer(uuid: number | string, title: string) {
      // 确保uuid是字符串类型
      const uuidStr = typeof uuid === 'number' ? uuid.toString() : uuid;
      console.log(`开始保存会话: uuid=${uuidStr}, title=${title}`);
      try {
        // 创建会话时，将前端的uuid作为自定义ID传递给后端
        console.log(`调用createConversation API: title=${title}, model=gpt-3.5-turbo, id=${uuidStr}`);
        const { data } = await createConversation(title, 'gpt-3.5-turbo', uuidStr);
        console.log('会话保存成功:', data);
        
        // 如果后端返回的会话ID与前端的uuid不一致，更新会话ID
        if (data && data._id) {
          console.log(`后端返回的会话ID: ${data._id}, 前端的uuid: ${uuidStr}`);
          if (data._id !== uuidStr) {
            console.log(`会话ID不一致，需要更新`);
            // 找到对应的会话索引
            const index = this.history.findIndex(item => item.uuid === uuid);
            console.log(`找到会话索引: ${index}`);
            if (index !== -1) {
              // 更新会话的uuid为后端返回的ID
              const newUuid = parseInt(data._id);
              const oldUuid = this.history[index].uuid;
              console.log(`更新会话UUID: ${oldUuid} -> ${newUuid}`);
              
              // 更新history数组中的uuid
              this.history[index].uuid = newUuid;
              
              // 更新chat数组中的uuid
              const chatIndex = this.chat.findIndex(item => item.uuid === oldUuid);
              console.log(`找到聊天索引: ${chatIndex}`);
              if (chatIndex !== -1) {
                this.chat[chatIndex].uuid = newUuid;
              }
              
              // 如果当前活动会话是被修改的会话，更新active
              if (this.active === oldUuid) {
                console.log(`更新活动会话: ${oldUuid} -> ${newUuid}`);
                this.active = newUuid;
              }
              
              this.recordState();
              console.log('会话ID更新完成');
            }
          } else {
            console.log(`会话ID一致，无需更新`);
          }
        } else {
          console.warn('后端返回的数据中没有会话ID:', data);
        }
      } catch (error) {
        console.error('保存会话失败:', error);
      }
    },
    
    // 更新后端数据库中的会话标题
    async updateConversationTitleOnServer(conversationId: string, title: string) {
      try {
        const { data } = await updateConversationTitle(conversationId, title);
        console.log('会话标题更新成功:', data);
      } catch (error) {
        console.error('更新会话标题失败:', error);
      }
    },
    
    // 从后端数据库中删除会话
    async deleteConversationFromServer(conversationId: string) {
      try {
        const { data } = await deleteConversation(conversationId);
        console.log('会话删除成功:', data);
      } catch (error) {
        console.error('删除会话失败:', error);
      }
    },
    
    // 保存消息到后端数据库
    async saveMessageToServer(conversationId: string, chat: Chat.Chat) {
      try {
        const { data } = await addMessageToConversation(
          conversationId,
          chat.inversion ? 'user' : 'assistant',
          chat.text
        );
        console.log('消息保存成功:', data);
        
        // 更新本地消息，添加后端返回的消息ID
        if (data && data._id) {
          chat._id = data._id;
        }
      } catch (error) {
        console.error('保存消息失败:', error);
      }
    },
    
    // 从后端数据库中删除消息
    async deleteMessageFromServer(messageId: string) {
      try {
        const { data } = await deleteMessage(messageId);
        console.log('消息删除成功:', data);
      } catch (error) {
        console.error('删除消息失败:', error);
      }
    },
    
    // 从后端数据库中清空会话消息
    async clearConversationMessagesOnServer(conversationId: string) {
      try {
        const { data } = await clearConversationMessages(conversationId);
        console.log('会话消息清空成功:', data);
      } catch (error) {
        console.error('清空会话消息失败:', error);
      }
    },
    
    // 从后端数据库加载用户的所有会话
    async loadUserConversations() {
      try {
        console.log('开始加载用户会话...');
        const { data } = await getUserConversations();
        console.log('加载用户会话成功:', data);
        
        if (data && Array.isArray(data)) {
          console.log(`找到 ${data.length} 个会话`);
          // 清空当前的会话列表
          this.history = [];
          this.chat = [];
          
          // 添加从后端加载的会话
          for (const conversation of data) {
            if (conversation && conversation._id) {
              console.log(`处理会话: ${conversation._id}, 标题: ${conversation.title}`);
              const uuid = parseInt(conversation._id);
              this.history.push({
                uuid,
                title: conversation.title || 'New Chat',
                isEdit: false
              });
              
              // 加载会话的消息
              await this.loadConversationMessages(uuid, conversation._id);
            } else {
              console.warn('发现无效的会话:', conversation);
            }
          }
          
          // 如果有会话，设置第一个会话为活动会话
          if (this.history.length > 0) {
            console.log(`设置活动会话: ${this.history[0].uuid}`);
            this.active = this.history[0].uuid;
          } else {
            console.log('没有找到会话，不设置活动会话');
          }
          
          this.recordState();
          console.log('会话加载完成，当前状态:', { history: this.history.length, chat: this.chat.length });
        } else {
          console.warn('服务器返回的数据无效:', data);
        }
      } catch (error) {
        console.error('加载用户会话失败:', error);
      }
    },
    
    // 加载会话的消息
    async loadConversationMessages(uuid: number, conversationId: string) {
      console.log(`开始加载会话消息: uuid=${uuid}, conversationId=${conversationId}`);
      try {
        console.log(`调用getConversationMessages API: conversationId=${conversationId}`);
        const { data } = await getConversationMessages(conversationId);
        console.log(`加载会话消息成功: 找到 ${data ? (Array.isArray(data) ? data.length : '非数组') : '无'} 条消息`);
        
        if (data && Array.isArray(data)) {
          console.log(`处理 ${data.length} 条消息`);
          const chatData: Chat.Chat[] = data.map(message => {
            console.log(`处理消息: id=${message._id}, role=${message.role}, content=${message.content.substring(0, 30)}...`);
            return {
              _id: message._id,
              dateTime: message.created_at ? new Date(message.created_at).toLocaleString() : new Date().toLocaleString(),
              text: message.content,
              inversion: message.role === 'user',
              error: false,
              loading: false,
              conversationOptions: null,
              requestOptions: { prompt: message.content, options: null }
            };
          });
          
          console.log(`添加 ${chatData.length} 条消息到会话 ${uuid}`);
          this.chat.push({ uuid, data: chatData });
        } else {
          console.log(`没有找到消息，添加空数组到会话 ${uuid}`);
          this.chat.push({ uuid, data: [] });
        }
      } catch (error) {
        console.error('加载会话消息失败:', error);
        console.log(`出错，添加空数组到会话 ${uuid}`);
        this.chat.push({ uuid, data: [] });
      }
    }
  },
})
