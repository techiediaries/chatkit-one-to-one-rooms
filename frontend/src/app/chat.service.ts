import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ChatManager, TokenProvider } from '@pusher/chatkit-client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  AUTH_URL = 'http://localhost:3000/token';
  INSTANCE_LOCATOR = 'v1:us1:8974881e-3870-47b4-9053-14dad6c0e314';
  GENERAL_ROOM_ID = '19374915';
  GENERAL_ROOM_INDEX = 0;

  chatManager: ChatManager;
  currentUser;
  messages = [];


  usersSubject = new BehaviorSubject([]);
  messagesSubject = new BehaviorSubject([]);

  typingUsers = [];

  constructor() { }

  async connectToChatkit(userId: string) {
    this.chatManager = new ChatManager({
      instanceLocator: this.INSTANCE_LOCATOR,
      userId: userId,
      tokenProvider: new TokenProvider({ url: this.AUTH_URL })
    })

    this.currentUser = await this.chatManager.connect();

    await this.currentUser.subscribeToRoom({
      roomId: this.GENERAL_ROOM_ID,
      hooks: {

        onMessage: message => {
          this.messages.push(message);
          this.messagesSubject.next(this.messages);
        },
        onUserStartedTyping: user => {
          this.typingUsers.push(user.name);
        },
        onUserStoppedTyping: user => {
          this.typingUsers = this.typingUsers.filter(username => username !== user.name);
        }        
      },
      messageLimit: 20
    });


    const users = this.currentUser.rooms[this.GENERAL_ROOM_INDEX].users;
    this.usersSubject.next(users);
  }


  getUsers() {
    return this.usersSubject;
  }

  getMessages() {
    return this.messagesSubject;
  }

  sendMessage(message) {
    if(message.attachment){
      return this.currentUser.sendMessage({
        text: message.text,
        attachment: { file: message.attachment, name: message.attachment.name },
        roomId: message.roomId || this.GENERAL_ROOM_ID
      });
    }
    else
    {
      return this.currentUser.sendMessage({
        text: message.text,
        roomId: message.roomId || this.GENERAL_ROOM_ID
      });
    }

  }

  isUserOnline(user): boolean {
    return user.presence.state == 'online';
  }

  getCurrentUser() {
    return this.currentUser;
  }
    

  sendTypingEvent(roomId = this.GENERAL_ROOM_ID){
    return this.currentUser.isTypingIn({ roomId: roomId });
  }
  // 1
  setReadCursor(messageId: number , roomId = this.GENERAL_ROOM_ID){
    this.currentUser.setReadCursor({
      roomId: roomId,
      position: messageId
    })
  }
  // 2
  getReadCursor(roomId = this.GENERAL_ROOM_ID){
    console.log("read")
    const cursor = this.currentUser.readCursor({
      roomId: roomId
    })

    
    console.log(`read up to message ID ${
      cursor.position
    } in ${
      cursor.room.name
    }.`)

    return cursor.position;
  }

  getTypingUsers(){
    return this.typingUsers;
  }
  
}
