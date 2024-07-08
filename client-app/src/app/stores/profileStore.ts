import { makeAutoObservable, runInAction } from "mobx";
import { Photo, Profile } from "../models/profile";
import agent from "../api/agent";
import { store } from "./store";

export default class ProfileStore{
         profile: Profile | null = null;
         loadingProfile = false;
         uploading = false;
         loading = false;
         deleting= false; 

         constructor() {
               makeAutoObservable(this);
         }

         get isCurrentUser() {
             if (store.userStore.user && this.profile){
                return store.userStore.user.userName === this.profile.userName
             }

             return false;
         }

         loadProfile = async (username: string) => {
            this.loadingProfile = true;
            try {
               const profile = await agent.Profiles.get(username);
               runInAction(() => {
                  this.profile = profile;
                  this.loadingProfile = false;
               })
            } catch (error) {
                console.log(error);
                runInAction(() => this.loadingProfile = false);
            }

            runInAction(() => this.loadingProfile = false);
         }

         uploadPhoto = async (file: Blob) =>  {
            this.uploading = true;
            try {
                const response = await agent.Profiles.uploadPhoto(file);
                const photo = response.data;
                runInAction(() => {
                    if (this.profile) {
                      this.profile.photos?.push(photo);
                      if (photo.isMain && store.userStore.user) {
                           store.userStore.setImage(photo.url);
                           this.profile.image = photo.url;
                      }
                    }
                    this.uploading = false; 
                })
            }
            catch (error)
            {
               console.log(error);
               this.uploading = false; 
               runInAction(() => this.uploading = false)
            }
         }

         setMainPhoto = async(photo: Photo) => {
              this.loading = true;
              try{
                   await agent.Profiles.setMainPhoto(photo.id);
                   runInAction(() => {
                          store.userStore.setImage(photo.url);
                          if (this.profile && this.profile.photos){
                               this.profile.photos.find(x => x.isMain)!.isMain = false;
                               this.profile.photos.find(x => x.id === photo.id)!.isMain = true; 
                               this.profile.image = photo.url;
                          }  
                          this.loading = false;                      
                        }
                   )    
              }
              catch(error)
              {
                console.log(error);               
                runInAction(() => this.loading = false)
              }
         }

         deletePhoto = async(photo: Photo) => {
            this.deleting = true;
            try{
               await agent.Profiles.deletePhoto(photo.id);
              runInAction(() => {
                  if (this.profile && this.profile.photos)
                  {                 
                     this.profile.photos = this.profile.photos?.filter(x => x.id !== photo.id);                                   
                  }
                  this.deleting = false; 
               }
             )
            }
            catch (error)
            {
               console.log(error);
               runInAction(() => this.deleting = false)               
            }

         }

         updateProfile = async (profile: Partial<Profile>) =>
            {
                 this.loading = true;
                 try {
                    await agent.Profiles.updateProfile(profile);
                    runInAction( () => {
                          if (profile.displayName && profile.displayName !== store.userStore.user?.displayName)      {
                               store.userStore.setDisplayName(profile.displayName);
                          }
                          this.profile = {...this.profile, ...profile as Profile}
                          this.loading = false
                     })
          
                 }
                 catch (error) {
                   console.log(error);
                   runInAction(() => this.loading = false);
                 }
            }

        
         
}