import { Component, OnDestroy } from '@angular/core';
import { OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ChatService } from '../chat.service';
import { User } from '../user';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  userId: string = '';
  userList: any = [];
  getUsersSubscription;
  constructor(private chatService: ChatService, private route: ActivatedRoute, private storage: Storage) { 
    
  }

  async ngOnInit() {
    this.userId = this.route.snapshot.params.id || await this.storage.get("USER_ID");
    //console.log("user id", this.userId);

    this.chatService.connectToChatkit(this.userId);
    this.getUsersSubscription = this.chatService.getUsers().subscribe((users) => {
      this.userList = users;
    });
  }

  // 66 - also import and implemtn OnDestroy, define and assign the getUsersSubscription
  ngOnDestroy(){
    this.getUsersSubscription.unsubscribe();
  }

  isOnline(user) {
    return this.chatService.isUserOnline(user);
  }
}
