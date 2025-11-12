import { Injectable } from '@angular/core';
// Firebase Module API functions
import {
 getDatabase,
  ref,
  set,
  get,
  update,
  remove,
  push,
  DataSnapshot,
  onValue,
} from 'firebase/database';
import { initializeApp } from 'firebase/app';

// getDatabase: takes in your account and project info and returns an instance (an object) giving you access to db functions
// ref: identifies a location/path within this database (looks like a folder with folders in it)
// set: puts an object in the database
// get: gets an object from the database once (returns a promise resolving with DataSnapshot)
// update: modifies an existing object in the database
// remove: removes an object from the database
// push: Adds an object to a database list. Autogenerates the ID
// onValue: subscribes to changes in the database. Gets called everytime the changes happen with new data.
// child: gives you a reference to your children

// Firebase Service
@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  db: any;

  constructor() {
    this.setupFirebase(); // How we pass account and project info
    this.db = getDatabase(); // this is how we get a db object to use to access all the others functions
  }
  setupFirebase() {
    const firebaseConfig = {
    apiKey: "AIzaSyAq4Yl6mcXjU_2Z7egA1OQOq3C0JCDZ0PQ",
    authDomain: "university-course-scheduling.firebaseapp.com",
    projectId: "university-course-scheduling",
    storageBucket: "university-course-scheduling.firebasestorage.app",
    messagingSenderId: "1033733372148",
    appId: "1:1033733372148:web:36cdf713e6c82c309c46a1"
  };
    initializeApp(firebaseConfig);
  }

   storeItemService(key: string, item: any)
  {
    const keyref = ref(this.db, key);
    set(keyref, item);
  }

  addItemService(key: string, item: any)
  {
    const keyref = ref(this.db, key);
    push(keyref, item);
  }

  getItemService(key: string)
  {
    let item: any = null; 
    const keyref = ref(this.db, key);
    onValue(keyref, (data) => {item = data.val()});
    return item;
  }

  getItemsService(key: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const items: any[] = [];
    const keyref = ref(this.db, key);
    
    onValue(keyref, (data) => {
      data.forEach((dataItem) => {
        items.push(dataItem);
      });
      resolve(items); 
    }, (error) => {
      reject(error); 
    });
  });
}

  removeItemFromListService(key: string, campus: string)
  {
    const keyref = ref(this.db, + campus + '/' + key);
    remove(keyref);
  }

  clearAllItemsService(key: string)
  {
    const keyref = ref(this.db, key)
    set(keyref, {});
  }

  // CRUD: Create, Retrieve, Update, Delete 
  create(path: string, data: any): Promise<void>{ // Create
    return set(ref(this.db, path), data);
  }
  async retrieve(path: string, key: string): Promise<DataSnapshot>{
    return await get(ref(this.db, path+"/"+key));
  }
  update(path: string, key: string, data: any): Promise<void>{ 
    return update(ref(this.db, path + "/" + key), data);
  }
  delete(path: string, key: string): Promise<void>{ 
    return remove(ref(this.db, path+"/"+key));
  }

  // Lists
  // Add to List
  pushToList(path: string, data: any){
    return push(ref(this.db, path), data).key;
  }
  // Delete from list
  deleteFromList(path: string, key: string){
    this.delete(path, key);
  }
  // Get List Once 
  async getList(path: string){
    const dblist = await get(ref(this.db, path));
    let locallist: any[] = [];
    dblist.forEach( item =>{locallist.push(item.val());});
    return locallist; 
  }
  reset(){
    this.delete("","");
  }
  getDB(){
    return this.db; 
  }
}

