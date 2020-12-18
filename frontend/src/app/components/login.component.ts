import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

	errorMessage = ''
  loginform: FormGroup

	constructor(private router: Router, private loginService: LoginService, private fb: FormBuilder) { }

	ngOnInit(): void { 
    this.loginform = this.fb.group({
      username: this.fb.control('', [Validators.required]),
      password: this.fb.control('', [Validators.required])
    })
  }

  login() {
    console.log('form processed: ', this.loginform.value)

    this.loginService.submitLoginDetails(this.loginform.value).subscribe(
      result=>{
        console.log('response from express: ', result)
        if (result === undefined) {
          this.errorMessage = 'Wrong username or password'
        } else {
          console.log('user authenticated!')
          this.router.navigate(['/main'])
        }
      }
    )
    this.loginService.loginCredentials = this.loginform.value
    console.log('credentials inside service: ', this.loginService.loginCredentials)

  }
}
