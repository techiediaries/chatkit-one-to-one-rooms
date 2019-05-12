import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable, ReplaySubject } from 'rxjs';
import { ChatManager, TokenProvider } from '@pusher/chatkit-client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  AUTH_URL = 'http://localhost:3000/token';
  INSTANCE_LOCATOR = 'v1:us1:8974881e-3870-47b4-9053-14dad6c0e314';
  GENERAL_ROOM_ID = "19376018";
  GENERAL_ROOM_INDEX = 0;

  chatManager: ChatManager;
  
  // 33 - make currentUser null
  currentUser = null;
  messages = [];


  usersSubject = new BehaviorSubject([]);
  messagesSubject = new BehaviorSubject([]);

  typingUsers = [];

  constructor() { }

  //11 
  isConnectedToChatkit(){
    return this.currentUser !== null;
  }
  // 77 -change this to use local array messages instead of this.messages 
  async connectToChatkit(userId: string) {
    let messages = [];
    this.chatManager = new ChatManager({
      instanceLocator: this.INSTANCE_LOCATOR,
      userId: userId,
      tokenProvider: new TokenProvider({ url: this.AUTH_URL })
    })

    this.currentUser = await this.chatManager.connect();

    //console.log("connect to Chatkit", this.currentUser);
    await this.currentUser.subscribeToRoom({
      roomId: this.GENERAL_ROOM_ID,
      hooks: {

        onMessage: message => {
          messages.push(message);
          this.messagesSubject.next(messages);
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

  // oo - 1
  async connectToRoom(roomId){
    console.log("Subscribe to room: ", roomId);
    let messageSubject = new ReplaySubject();

    await this.currentUser.subscribeToRoom({
      roomId: roomId,
      hooks: {

        onMessage: message => {
          console.log("Got message: ", message);
          messageSubject.next(message);
        }        
      },
      messageLimit: 20
    }).then(currentRoom => {
      console.log("Subscribed to room: ", roomId);
    }); 
    
    return messageSubject;
  }


  getCurrentRoomId(otherUserId){

    // new - changed this to behavior subject
    
    let returnObs = new BehaviorSubject(null);
    let userRooms: Array<any> = this.currentUser.rooms;
    const userId = this.currentUser.id;
    let name = `${userId}-${otherUserId}`;
    let altName = `${otherUserId}-${userId}`;
    
    let roomExists = userRooms.findIndex((room) =>{

      if(room['name'] === name || room['name'] === altName)
      {
        return true;
      }

      return false;
      
    });    

    if(roomExists !== -1) {
      console.log("Room exists: ", userRooms[roomExists])
      returnObs.next(userRooms[roomExists].id)
      return returnObs;
    }

    this.currentUser.createRoom({
      name,
      private: true,
      addUserIds: [otherUserId]
    }).then(room => {

      returnObs.next(room.id);
      //this.connectToRoom(room.id);
    })
    .catch(err => {
      console.log(`Error creating room ${err}`)
    })

    return returnObs;
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
  // 88 - change this
  getReadCursor(roomId = this.GENERAL_ROOM_ID) {
    console.log("read")
    const cursor = this.currentUser.readCursor({
      roomId: roomId
    })

    if (cursor) {
      console.log(`read up to message ID ${
        cursor.position
        } in ${
        cursor.room.name
        }.`)

      return cursor.position;
    } else {
      return -1;
    }

  }

  getTypingUsers(){
    return this.typingUsers;
  }
  
}
