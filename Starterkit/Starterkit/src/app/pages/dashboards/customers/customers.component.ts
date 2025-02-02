import {Component, QueryList, ViewChildren} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {Observable, throwError} from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import {UntypedFormBuilder, UntypedFormGroup, FormArray, Validators, FormBuilder, FormGroup} from '@angular/forms';

import Swal from 'sweetalert2';

import { Customers, Customer } from './customers.model';
import { customersData } from './data';
import { CustomersService } from './customers.service';
import { NgbdCustomersSortableHeader, SortEvent } from './customers-sortable.directive';
import {HttpClient} from "@angular/common/http";
import {catchError} from "rxjs/operators";

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
  providers: [CustomersService, DecimalPipe]
})

/**
 * Ecomerce Customers component
 */
export class CustomersComponent {

  modalRef?: BsModalRef;

  // bread crumb items
  breadCrumbItems: Array<{}>;
  formData: UntypedFormGroup;
  submitted: boolean = false;
  term: any;

  // page
  currentpage: number;

  // Table data
  content?: any;
  customersData?: any;
  customersList!: Observable<Customers[]>;
  total: Observable<number>;
  date: { year: number, month: number };
  customerss!: Observable<Array<Customer>>;
  errorMessage! : object;
  searchformGroup! :FormGroup;
  newCustomerFormGroup! : FormGroup;
  @ViewChildren(NgbdCustomersSortableHeader) headers!: QueryList<NgbdCustomersSortableHeader>;

  constructor(private modalService: BsModalService, private formBuilder: UntypedFormBuilder, public service: CustomersService, private fb: FormBuilder) {
    this.customersList = service.customers$;
    this.total = service.total$;
  }

  ngOnInit() {
    this.searchformGroup = this.fb.group({
      keyword: this.fb.control("")
    })
    this.handleSearchCustomers();
    this.customerss = this.service.getCustomers().pipe(
      catchError(err => {
        this.errorMessage = err
        return throwError(err)
      })
    );

    this.breadCrumbItems = [{ label: 'Clients' }, { label: 'Liste clients', active: true }];

    this.formData = this.formBuilder.group({
      ids: [''],
      username: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
      address: ['', [Validators.required]],
      balance: ['', [Validators.required]]
    });

    this.newCustomerFormGroup = this.fb.group({
      name: ['', [Validators.required,Validators.minLength(4)]],
      phoneNumber: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
      address: ['', [Validators.required]],
      birthDate: ['', [Validators.required]],
    });

    this.currentpage = 1;

    /**
     * Fetches the data
     */
    this._fetchData();
  }

  handleSearchCustomers() {
    let kw = this.searchformGroup?.value.keyword;
    this.customerss = this.service.searchCustomers(kw).pipe(
      catchError(err => {
        this.errorMessage = err
        return throwError(err)
      })
    )
  }
  /**
   * Customers data fetches
   */
  private _fetchData() {
    // this.customersData = customersData;
    this.customersList.subscribe(x => {
      this.content = this.customersData;
      this.customersData =  Object.assign([], x);
    });
  }
  get form() {
    return this.formData.controls;
  }

  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.submitted = false;
    this.modalRef = this.modalService.show(content);
  }

  saveCustomer() {
    const currentDate = new Date();
    if (this.formData.valid) {
      if (this.formData.get('ids')?.value) {
        this.customersData = customersData.map((data: { id: any; }) => data.id === this.formData.get('ids')?.value ? { ...data, ...this.formData.value } : data)
      }else{
      const username = this.formData.get('name').value;
      const email = this.formData.get('email').value;
      const phone = this.formData.get('phoneNumber').value;
      const address = this.formData.get('address').value;
      const balance = this.formData.get('balance').value;
      customersData.push({
        id: this.customersData.length + 1,
        username,
        email,
        phone,
        address,
        balance,
        rating: '4.3',
        date: currentDate + ':'
      })
      }
      this.modalService.hide()
    }
    this.submitted = true
  }

  // Delete Data
  delete(id:any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger ms-2'
      },
      buttonsStyling: false
    });

    swalWithBootstrapButtons
      .fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        showCancelButton: true
      })
      .then(result => {
        if (result.value) {
          swalWithBootstrapButtons.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          );
          document.getElementById('c_'+ id)?.remove();
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            'Cancelled',
            'Your imaginary file is safe :)',
            'error'
          );
        }
      });
  }

  /**
   * Open Edit modal
   * @param content modal content
   */
   editDataGet(id: any, content:any) {
    this.submitted = false;
    this.modalRef = this.modalService.show(content, { class: 'modal-md' });
    var modelTitle = document.querySelector('.modal-title') as HTMLAreaElement;
    modelTitle.innerHTML = 'Edit Customer';
    var updateBtn = document.getElementById('btn-save-event') as HTMLAreaElement;
     updateBtn.innerHTML = "Update";
    var listData = this.customersData.filter((data: { id: any; }) => data.id === id);
    this.formData.controls['username'].setValue(listData[0].username);
    this.formData.controls['email'].setValue(listData[0].email);
    this.formData.controls['phone'].setValue(listData[0].phone);
    this.formData.controls['address'].setValue(listData[0].address);
    this.formData.controls['balance'].setValue(listData[0].balance);
    this.formData.controls['ids'].setValue(listData[0].id);
  }

  handleSaveCustomer() {
    let customer : Customer = this.newCustomerFormGroup.value;
    this.service.saveCustomer(customer).subscribe({
      next : data => {
        alert("Client enregistré avec succés")
        this.modalService.hide()
      },
      error : err => {
        console.log(err);
      }
    })
    this.handleSearchCustomers()
   }

   handleBlockCustomer(c: Customer) {
     let conf = confirm("Vous êtes sure de vouloir bloquer ce client?")
     if(!conf) return;
     this.service.blockCustomer({...c, isBlocked: true},c.id).subscribe({
       next : (resp) => {
         this.handleSearchCustomers();
       },
       error : err => {
         console.log(err);
       }
     });
   }

  handleUnblockCustomer(c: Customer) {
    this.service.unblockCustomer({...c, isBlocked: false},c.id).subscribe({
      next : (resp) => {
        this.handleSearchCustomers();
      },
      error : err => {
        console.log(err);
      }
    });
  }
}
