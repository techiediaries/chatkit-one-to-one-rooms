import { Component, OnInit, OnDestroy } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { ChatService } from '../chat.service';

import { Storage } from '@ionic/storage';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-private-chat',
  templateUrl: './private-chat.page.html',
  styleUrls: ['./private-chat.page.scss'],
})
export class PrivateChatPage implements OnInit, OnDestroy {

  roomId;
  messageList: any[] = [];
  chatMessage: string = "";

  messageSubscription;
  roomSubscription;

  constructor(private router: Router,private route: ActivatedRoute, private chatService: ChatService, private storage: Storage, private authService: AuthService ) { }

  async ngOnInit() {
    const userId = await this.storage.get("USER_ID");
    if(!this.chatService.isConnectedToChatkit()){
      await this.chatService.connectToChatkit(userId);
    }
    
    const otherUserId = this.route.snapshot.params.id;
    console.log("Getting messages");
    this.roomSubscription = this.chatService.getCurrentRoomId(otherUserId).subscribe(async (roomId)=>{
      console.log("Got room id: ", roomId);
      this.roomId = roomId;
      this.messageSubscription = (await this.chatService.connectToRoom(roomId)).subscribe( message => {
        console.log("Message: ", message);
        this.messageList.push(message);
      });
    });
  }
  ngOnDestroy(){
    console.log("OnDestory");
    if(this.roomSubscription){
      this.roomSubscription.unsubscribe();
    }
    if(this.messageSubscription){
      this.messageSubscription.unsubscribe();
    }
  }
  sendMessage() {
    console.log("Sending a Message: ", this.chatMessage);
    this.chatService.sendMessage({ text: this.chatMessage , roomId: this.roomId}).then((messageId) => {
      this.chatMessage = "";
    });
  }
  async logout(){
    await this.authService.logout();
    this.router.navigateByUrl('/login');
  }

}
