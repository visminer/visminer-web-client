import { Component, OnInit } from '@angular/core';
import { Repository } from '../shared/models/Repository';
import { Reference } from '../shared/models/Reference';

import { VisminerService } from '../shared/services/visminer.service';
import { TDManagementService } from './tdmanagement.service';
import { TDItem } from '../shared/models/TDItem';
import { debounce } from 'rxjs/operators/debounce';

@Component({
  selector: 'app-tdmanagement',
  templateUrl: './tdmanagement.component.html',
  styleUrls: ['./tdmanagement.component.css']
})
export class TDManagementComponent implements OnInit {

  repository: Repository; 
  references: Reference[]; 
  tdItems: TDItem[] = [];
  todoCount: number = 0;
  doingCount: number = 0;
  doneCount: number = 0;

  constructor(private tdManagementServ: TDManagementService, private visminerServ: VisminerService) { }

  ngOnInit() {
    this.repository = this.visminerServ.repository;
    this.references = this.visminerServ.references;

    // TODO: Give the option to choose which ref to analyze
    if (this.repository) {
      this.tdManagementServ.getTDByRepoAndRef(this.repository._id, 'master').subscribe(
        data => {
          this.tdItems = data;
          this.countDebts();
        }
      );
    }  
  }

  countDebts() {
    this.tdItems.forEach( tdItem => {
      tdItem.debts.forEach( debtObj => {
        if (debtObj.value == 1)
          this.todoCount++;
        else if (debtObj.value == 2)
          this.doingCount++;
        else if (debtObj.value == 3)
          this.doneCount++;
      });      
    });
  }

  kanbanBoardEvent(event) {
    let index = this.tdItems.indexOf(event.tdItem, 0);
    if (index > -1) {
      if (event.action === 'pay') {
        this.tdItems[index].debts.find(debt => debt.name === event.debtName).value = 2;
        this.todoCount--;
        this.doingCount++;
      }  
      else if (event.action === 'paid') {
        this.tdItems[index].debts.find(debt => debt.name === event.debtName).value = 3;
        this.doingCount--;
        this.doneCount++;
      }
    }
  }
}