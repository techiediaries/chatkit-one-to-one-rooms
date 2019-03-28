import { Component, OnInit, OnDestroy, AfterViewChecked, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../chat.service';
import { AuthService } from '../auth.service';
import { User } from '../user';
import {Content} from "@ionic/angular";

import { Storage } from '@ionic/storage';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit, AfterViewChecked, OnDestroy {

  messageList: any[] = [];
  chatMessage: string = "";
  attachment: File = null;
  @ViewChild('scrollArea') content: Content;
  //3
  readPosition: number;
  userTyped = false; 
  unreadCount = 0;
  getMessagesSubscription;

  constructor(private router: Router, private chatService: ChatService, private authService: AuthService, private storage: Storage, private cdRef : ChangeDetectorRef) { }


  async ngOnInit() {
    // console.log("Chat Page Init");
    // 22 (import and inject Storage), make nOnInit async
    const userId = await this.storage.get("USER_ID");
    if(!this.chatService.isConnectedToChatkit()){
      await this.chatService.connectToChatkit(userId);
    }
    this.getMessagesSubscription = this.chatService.getMessages().subscribe(messages => {
      //console.log("Messages: ", messages);
      this.messageList = messages;

      this.scrollToBottom();
      this.readPosition = this.chatService.getReadCursor();
      
      this.unreadCount = this.messageList.length - this.getReadMessageId() - 1;

      /*console.log("Message List Length", this.messageList.length );
      console.log("Read Message Id: ", this.getReadMessageId());

      console.log("Unread messages count: ", this.unreadCount);*/
      

    });
  }

  // 55, import and implement OnDestroy, define and assign getMessagesSubscription
  ngOnDestroy(){
    if(this.getMessagesSubscription){
      this.getMessagesSubscription.unsubscribe();
    }
  }

  ngAfterViewChecked(){
    this.cdRef.detectChanges();
  }

  


  isMostRecentReadMessage(messageDom, msg){
    let lastMessage = this.messageList[this.messageList.length - 1];
    let messageId = Number(messageDom.getAttribute('data-message-id'));
    //console.log("Most recent message id", messageId);
    
    return messageId == this.readPosition && !this.userTyped && messageId !== lastMessage.id;

  }
  // 4
  /*getReadMessage(){
    let messages = this.messageList.filter(m =>{
      if (m.id == this.readPosition) return m;
    })

    if(messages.length > 0) return messages[0];

    return null;
  }*/
  //5
  getReadMessageId(){
    
    let i = 0, l = this.messageList.length;
    for(i; i < l; i++) {
      if(this.messageList[i].id == this.readPosition)
      {
        return i;
      } 
    }
    return l;
  }

  
  sendMessage() {
    this.chatService.sendMessage({ text: this.chatMessage, attachment: this.attachment }).then((messageId) => {
      this.chatMessage = "";
      this.attachment = null;
      this.scrollToBottom();
      console.log("set read, ", messageId);
      // We make the sent message the current read cursor
      this.chatService.setReadCursor(messageId);
      
    });
  }



  get typingUsers(){
    return this.chatService.getTypingUsers();
  }

  // 2
  onFocus(e){
    
    const messageListLength = this.messageList.length;
    let messageId = this.messageList[messageListLength - 1].id;
    console.log("Most recent message:", this.messageList[messageListLength - 1].text)
    // When the text area has focus we consider the user has read the latest messages in the group
    this.chatService.setReadCursor(messageId);
    this.scrollToBottom();
  }
  onKeydown(e){
    this.chatService.sendTypingEvent();
    this.userTyped = true;
  }
  onKeyup(e){
    this.chatService.sendTypingEvent();
  }
  attachFile(e){
    if (e.target.files.length == 0) {
      console.log("No file selected!");
      return
    }
    let file: File = e.target.files[0];
    console.log(file);
    this.attachment = file;
  }
  scrollToBottom() {

    setTimeout(()=>{
      if (this.content.scrollToBottom) {
        this.content.scrollToBottom();
      }
    }, 1000);

  }

  // 55 - change logout method
  async logout(){
    await this.authService.logout();
    if(this.getMessagesSubscription){
      this.getMessagesSubscription.unsubscribe();
    }

    this.router.navigateByUrl('/login');
  }

}
