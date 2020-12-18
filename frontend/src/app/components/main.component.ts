import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {CameraService} from '../camera.service';
import { LoginService } from '../login.service';
import { ShareService } from '../share.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

	imagePath = '/assets/cactus.png'
	// isImagePathCactus: boolean = true
	isThereImage: boolean = false
	mainform: FormGroup

	constructor(private cameraSvc: CameraService, private fb: FormBuilder, private shareService: ShareService, private loginService: LoginService, private http: HttpClient) { }

	ngOnInit(): void {
		if (this.cameraSvc.hasImage()) {
			const img = this.cameraSvc.getImage()
			console.log('img captured :>>>', img)
			this.imagePath = img.imageAsDataUrl
			this.isThereImage = this.cameraSvc.hasImage()
		}

		this.mainform = this.fb.group({
			title: this.fb.control('', [Validators.required]),
			comments: this.fb.control('', [Validators.required]),
			username: this.fb.control(this.loginService.loginCredentials.username, [Validators.required]),
			password: this.fb.control(this.loginService.loginCredentials.password, [Validators.required]),
		})
	}

	clear() {
		this.imagePath = '/assets/cactus.png'
		this.cameraSvc.clear()
		this.mainform.reset()
		this.isThereImage = this.cameraSvc.hasImage()
	}

	share() {
		const formData = new FormData();
    	formData.set('title', this.mainform.get('title').value);
		formData.set('comments', this.mainform.get('comments').value);
		formData.set('username', this.mainform.get('username').value);
		formData.set('password', this.mainform.get('password').value);
		formData.set('upload', this.cameraSvc.getImage().imageData);

		this.http.post('/share', formData).toPromise()
			.then()

		// this.shareService.share(formData)
		// 	.subscribe()
		this.clear()
	}
}
