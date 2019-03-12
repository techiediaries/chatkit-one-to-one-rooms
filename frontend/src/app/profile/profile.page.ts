import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  SERVER_URL = 'http://localhost:3000/avatar';
  fileToUpload: File = null;
  userId = null;
  avatarURL;
  constructor(private httpClient: HttpClient, private storage: Storage) { }

  async ngOnInit() {
    this.userId =  await this.storage.get("USER_ID");
  }
  attachFile(e){
    if (e.target.files.length == 0) {
      console.log("No file selected!");
      return
    }
    let file: File = e.target.files[0];
    //console.log(file);
    this.fileToUpload = file;
  }
  uploadAvatar(f){
    let formData = new FormData(); 
    formData.append('file', this.fileToUpload, this.fileToUpload.name); 
    formData.append('userId', this.userId);
    
    this.httpClient.post(this.SERVER_URL, formData).subscribe((res) => {
    
    console.log(res);
    this.avatarURL = res['avatarURL'];
    });
    return false;     
  }

}
