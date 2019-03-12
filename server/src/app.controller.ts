import { Get, Post, Body,Request, Res, Param, Controller} from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { User } from './models/user.entity';
import { UseInterceptors, FileInterceptor, UploadedFile } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

//import { URL } from 'url';

@Controller()
export class AppController {
  SERVER_URL = 'http://localhost:3000/';

  constructor(private readonly authService: AuthService) {}

  @Post('token')
  async token(@Request() req): Promise<any> {
    return this.authService.getToken(req.query.user_id).body;
  }

  @Post('login')
  async login(@Body() userData: User): Promise<any> {
    return this.authService.login(userData);
  }  

  @Post('register')
  async register(@Body() userData: User): Promise<any> {
    //console.log(userData);
    return this.authService.register(userData);
  }

  @Get('uploads/:imgId')
  async uploads(@Param('imgId') imgId, @Res() res): Promise<any> {
   
    res.sendFile(imgId, { root: 'uploads'});
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file',
    {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
          return cb(null, `${randomName}${extname(file.originalname)}`)
        }
      })

    }
  )
  )
  uploadAvatar(@Body() userData, @UploadedFile() file) {
    console.log(file);
    let userId = userData.userId;

    this.authService.updateUserAvatar({
      userId: userId,
      avatarURL: `${this.SERVER_URL}${file.path}`
    });

    return {
      avatarURL:  `${this.SERVER_URL}${file.path}`
    };
  }
  
}
