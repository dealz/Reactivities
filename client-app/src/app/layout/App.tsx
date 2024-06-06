import { useEffect, useState } from 'react'
import './styles.css'
import {  Container } from 'semantic-ui-react';
import { Activity } from '../models/activity';
import NavBar from './NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import {v4 as uuid} from 'uuid';
import agent from '../api/agent';
import LoadingComponent from './LoadingComponent';
import { useStore } from '../stores/store';
import { observer } from 'mobx-react-lite'


function App() {  
const {activityStore}  = useStore();
const [activities, setActivities] = useState<Activity[]>([]);
const [selectedActivity, setSelectedActivity] = useState<Activity| undefined>(undefined);
const [editMode, setEditMode] = useState(false);

const [submitting, setSubmitting] = useState(false);

useEffect(() => {    
    // agent.Activities.list().then(response => {
    //   let activities: Activity[] = [];
    //   response.forEach(activity =>{
    //       activity.date = activity.date.split('T')[0];
    //       activities.push(activity);
    //   }) 
    //   setActivities(activities);
    //   setLoading(false);
    // }) className="load"></activities>
    activityStore.loadActivities();
  }, [activityStore])

  function handleSelectActivity(id: string){
    setSelectedActivity(activities.find(x => x.id ===id))
  }
   
  function handleCreateOrEditActivity(activity: Activity )
  {
    setSubmitting(true);
    if (activity.id){
      agent.Activities.update(activity).then(() =>{
        setActivities([...activities.filter(x=> x.id !==activity.id), activity])
        setEditMode(false);
        setSelectedActivity(activity);
        setSubmitting(false);
        }
        )
    }
    else {
      activity.id=uuid();
      agent.Activities.create(activity).then(() => {
        setActivities([...activities, activity]);
        setEditMode(false);
        setSelectedActivity(activity);
        setSubmitting(false);     
        }
      )
     }
   }


  function handleCancelSelectActivity()
  {
    setSelectedActivity(undefined);
  }

  function handleFormOpen(id?: string)
  {
     id ? handleSelectActivity(id): handleCancelSelectActivity();
     setEditMode(true);
  }

  function handleFormClose() {
     setEditMode(false);
  }

  function handleDeleteActivity(id:string){
    setSubmitting(true);
    agent.Activities.delete(id).then(() => {
      setActivities([...activities.filter(x => x.id !==id )]);
      setSubmitting(false);
    }
  )
    
   
  }

  if (activityStore.loadingInitial) return <LoadingComponent  content='Please wait. Loading app...'/>

  return (
    <>
         <NavBar openForm={handleFormOpen}/>
         <Container style={{marginTop:'7em'}}>            
            <ActivityDashboard 
                                    activities={activityStore.activities}
                                selectedActivity={selectedActivity}
                                //selectedActivity={activityStore.selectedActivity}
                                selectActivity={handleSelectActivity}
                                cancelSelectActivity={handleCancelSelectActivity}
                                editMode={editMode}
                                //editMode={activityStore.editMode}
                                openForm={handleFormOpen}
                                closeForm={handleFormClose}
                                createOrEdit={handleCreateOrEditActivity}
                                deleteActivity={handleDeleteActivity}
                                submitting={submitting}

            ></ActivityDashboard>
         </Container>

         
    </>
    

  )
}

export default observer(App);
