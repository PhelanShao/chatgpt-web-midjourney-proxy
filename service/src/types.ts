import { ChatMessage } from './chatgpt'

export interface RequestProps {
  prompt: string
  options?: ChatMessage[]
  systemMessage?: string
  temperature?: number
  top_p?: number
}

// 扩展Express的Request接口，添加file属性
declare global {
  namespace Express {
    interface Request {
      file?: {
        buffer?: Buffer;
        originalname?: string;
        filename?: string;
      };
    }
  }
}
