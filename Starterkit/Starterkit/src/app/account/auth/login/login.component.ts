// import { Component, OnInit } from '@angular/core';
// import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

// import { AuthenticationService } from '../../../core/services/auth.service';
// import { AuthfakeauthenticationService } from '../../../core/services/authfake.service';

// import { ActivatedRoute, Router } from '@angular/router';
// import { first } from 'rxjs/operators';

// import { environment } from '../../../../environments/environment';

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.scss']
// })

// /**
//  * Login component
//  */
// export class LoginComponent implements OnInit {

//   loginForm: UntypedFormGroup;
//   submitted:boolean = false;
//   error:string = '';
//   returnUrl: string;

//   // set the currenr year
//   year: number = new Date().getFullYear();

//   // tslint:disable-next-line: max-line-length
//   constructor(private formBuilder: UntypedFormBuilder, private route: ActivatedRoute, private router: Router, private authenticationService: AuthenticationService,
//     private authFackservice: AuthfakeauthenticationService) { }

//   ngOnInit() {


//     // reset login status
//     // this.authenticationService.logout();
//     // get return url from route parameters or default to '/'
//     // tslint:disable-next-line: no-string-literal
//     this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
//   }

//   // convenience getter for easy access to form fields
//   get f() { return this.loginForm.controls; }

//   /**
//    * Form submit
//    */
//   onSubmit() {
//     this.submitted = true;

//     // stop here if form is invalid
//     if (this.loginForm.invalid) {
//       return;
//     } else {
//       if (environment.defaultauth === 'firebase') {
//         this.authenticationService.login(this.f.email.value, this.f.password.value).then((res: any) => {
//           this.router.navigate(['/dashboard']);
//         })
//           .catch(error => {
//             this.error = error ? error : '';
//           });
//       } else {
//         this.authFackservice.login(this.f.email.value, this.f.password.value)
//           .pipe(first())
//           .subscribe(
//             data => {
//               this.router.navigate(['/dashboard']);
//             },
//             error => {
//               this.error = error ? error : '';
//             });
//       }
//     }
//   }
// }
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

/**
 * Login component
 */
export class LoginComponent implements OnInit {

  loginForm: UntypedFormGroup;
  submitted:boolean = false;
  error:string = '';
  returnUrl: string;

  // set the current year
  year: number = new Date().getFullYear();

  // tslint:disable-next-line: max-line-length
  constructor(
    private formBuilder: UntypedFormBuilder, 
    private route: ActivatedRoute, 
    private router: Router, 
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // get return url from route parameters or default to '/'
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  /**
   * Form submit
   */
  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    } else {
      this.http.post<any>(`${environment.backendHost}/auth/login`, {
        email: this.f.email.value,
        password: this.f.password.value
      }).subscribe(
        data => {
          localStorage.setItem('currentUser', JSON.stringify(data));
          this.router.navigate(['/dashboard']);
        },
        error => {
          this.error = error.error ? error.error : 'Login failed';
        });
    }
  }
}
