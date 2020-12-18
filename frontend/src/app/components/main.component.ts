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

	constructor(private cameraSvc: CameraService, private fb: FormBuilder, private shareService: ShareService, private loginService: LoginService) { }

	ngOnInit(): void {
		// console.log('isImagePathCactus?', this.isImagePathCactus)
		console.log('hasImage?', this.cameraSvc.hasImage())
		if (this.cameraSvc.hasImage()) {
			const img = this.cameraSvc.getImage()
			console.log('img captured :>>>', img)
			this.imagePath = img.imageAsDataUrl
			// this.isImagePathCactus = false
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
		// this.isImagePathCactus = true
		console.log('hasImage?', this.cameraSvc.hasImage())
		this.isThereImage = this.cameraSvc.hasImage()
	}

	share() {
		console.log('sharing these details...>', this.mainform.value)
		this.shareService.share(this.mainform.value)
			.subscribe()
	}
}
