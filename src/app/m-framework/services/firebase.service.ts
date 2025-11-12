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
  equalTo,
  query,
  orderByChild
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
  currentUser: any = null;
  currentUserCampus: any = null;

   slots_MW: {num: number, time: string}[] = [
      {num: 1, time: "Slot 1 MW 09:00 to 10:45"},
      {num: 2, time: "Slot 2 MW 10:55 to 12:40"},
      {num: 3, time: "Slot 3 MW 12:50 to 14:35"},
      {num: 4, time: "Slot 4 MW 15:00 to 16:45"},
      {num: 5, time: "Slot 5 MW 16:55 to 18:40"},
      {num: 6, time: "Slot 6 MW 18:50 to 20:35"},
      {num: 7, time: "Slot 7 MW 20:45 to 22:30"},
    ];

  slots_TR: {num: number, time: string}[] = [
    {num: 8,  time: "Slot 1 TR 09:00 to 10:45"},
    {num: 9,  time: "Slot 2 TR 10:55 to 12:40"},
    {num: 10, time: "Slot 3 TR 12:50 to 14:35"},
    {num: 11, time: "Slot 4 TR 15:00 to 16:45"},
    {num: 12, time: "Slot 5 TR 16:55 to 18:40"},
    {num: 13, time: "Slot 6 TR 18:50 to 20:35"},
    {num: 14, time: "Slot 7 TR 20:45 to 22:30"}
    ];

    slot_button: number = 0;
    
    al_ain: boolean = false;
    abu_dhabi: boolean = false;

    search_object: any;
    from_deletion: boolean = false;

    loadpage: boolean = false;
    selected_instructor: string = "";

    from_error: boolean = false;
    selected_error: any = null;

    clear()
    {
      this.slot_button = 0;
      this.al_ain = false;
      this.abu_dhabi = false;

      this.search_object = null
      this.from_deletion = false;

      this.loadpage = false;
      this.selected_instructor = "";

      this.from_error = false;
      this.selected_error = null;
    }

  constructor() {
    this.setupFirebase(); // How we pass account and project info
    this.db = getDatabase(); // this is how we get a db object to use to access all the others functions
  }
  setupFirebase() {
    const firebaseConfig = {
      apiKey: "AIzaSyBgb61A1yS8VRZj1z7319JrTWLsRRL3klA",
      authDomain: "storage-50c4f.firebaseapp.com",
      databaseURL: "https://storage-50c4f-default-rtdb.firebaseio.com",
      projectId: "storage-50c4f",
      storageBucket: "storage-50c4f.firebasestorage.app",
      messagingSenderId: "938727544220",
      appId: "1:938727544220:web:a4bb0aec7a4d1a7be2e459"
    };
    
    initializeApp(firebaseConfig);
  }

   storeItemService(key: string, item: any)
  {
    const keyref = ref(this.db, key);
    set(keyref, item);
  }

  addItemService(key: string, item: any): Promise<any>
  {
    const keyref = ref(this.db, key);
    const pushPromise = push(keyref, item);
    return Promise.resolve(pushPromise);
  }

  getItemService(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const keyref = ref(this.db, key);
      onValue(keyref, (data) => {
        resolve(data.val());
      }, (error) => {
        reject(error);
      });
    });
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

  removeItemFromListService(key: string, campus: string): Promise<void>
  {
    const keyref = ref(this.db, campus + '/' + key);
    return remove(keyref);
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

  // Student Authentication
  async registerUser(id: string, password: string,campus: string, type: string): Promise<boolean> {
    try {
      const existingStudent = await get(ref(this.db, `users/${id}`));
      if (existingStudent.exists()) return false;

      const studentInfo = {
        id: id,
        password: password,
        user: type,
        campus: campus,
        courses: {}
      };
      
      await set(ref(this.db, `users/${id}`), studentInfo);
      return true;
    } catch (error) {
      console.error('Error registering student:', error);
      return false;
    }
  }
  
  async login(id: string, password: string): Promise<boolean> {
    try {
      const student = await get(ref(this.db, `users/${id}`));
      if (student === null || !student.exists()) return false;

      const studentData = student.val();
      if (studentData.password === password) {
        this.currentUser = id;
        this.currentUserCampus = studentData.campus || '';
        return true;
      }

      return false;

    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    }
  }
  
  logout() {
    this.currentUser = null;
    this.currentUserCampus = null;
  }
  
  getCurrentUser() {
    return this.currentUser;
  }

  getCurrentUser2(): Promise<boolean> {
    return this.currentUser
  }

  getCurrentUserCampus() {
    return this.currentUserCampus;
  }
  
  isLoggedIn(): boolean {
    return this.currentUser != null;
  }
}