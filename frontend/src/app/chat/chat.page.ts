import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../chat.service';
import { AuthService } from '../auth.service';
import { User } from '../user';
import {Content} from "@ionic/angular";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  messageList: any[] = [];
  chatMessage: string = "";
  attachment: File = null;
  @ViewChild('scrollArea') content: Content;
  //3
  readPosition: number;
  userTyped = false; 
  unreadCount = 0;
  
  constructor(private router: Router, private chatService: ChatService, private authService: AuthService) { }


  ngOnInit() {
    this.chatService.getMessages().subscribe(messages => {
      this.messageList = messages;
      this.scrollToBottom();
      this.readPosition = this.chatService.getReadCursor();
      //let unreadMessage = this.getReadMessage();
      this.unreadCount = this.messageList.length - this.getReadMessageId() - 1;

    });
    
  }

  isMostRecentReadMessage(messageDom, msg){
    let lastMessage = this.messageList[this.messageList.length - 1];
    let messageId = Number(messageDom.getAttribute('data-message-id'));
    
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

  async logout(){
    await this.authService.logout();
    this.router.navigateByUrl('/login');
  }

}
