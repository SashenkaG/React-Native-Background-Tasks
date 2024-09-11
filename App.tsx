import axios from 'axios';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import BackgroundJob from 'react-native-background-actions';

const api = axios.create({
  baseURL: 'https://notes-backend-sashenkag-sashenkas-projects.vercel.app/api',
  withCredentials: true, // If your backend uses cookies
});
const fetchNotes = async () => {
  try {
    const response = await api.get('/get-notes');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
// Define the type for taskData
interface TaskData {
  delay: number;
}

// Helper function to simulate sleep/delay
const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay));

// Background task handler
const taskRandom = async (taskData?: TaskData) => {
  if (Platform.OS === 'android') {
    console.warn(
      'This task will not keep your app alive in the background by itself. Use other libraries to ensure the app stays alive in the background.'
    );
  }

  const delay = taskData?.delay ?? 30000; // Default to 30 seconds if delay is undefined
  console.log('Task started with delay:', delay);

  while (BackgroundJob.isRunning()) {
    console.log('Hello'); // Log "Hello" every delay period //can use this to call an api
    try {
      const notes = await fetchNotes();
    console.log("notes", notes);
    } catch (error) {
      console.log("error getting data-",error)
    }
    await sleep(delay); // Wait for the delay
  }
};

// Configuration options for the background job
const options = {
  taskName: 'Example',
  taskTitle: 'Example Task Title',
  taskDesc: 'Example Task Description',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#ff00ff',
  parameters: {
    delay: 30000, // 1 minute in milliseconds
  },
};

const App: React.FC = () => {
  const [playing, setPlaying] = useState(BackgroundJob.isRunning());

  // Function to start/stop the background task
  const toggleBackground = async () => {
    if (!playing) {
      try {
        console.log('Trying to start background service');
        
        if (BackgroundJob && BackgroundJob.start) {
          await BackgroundJob.start(taskRandom, options);
          console.log('Background service started successfully!');
        } else {
          console.error('BackgroundJob or BackgroundJob.start is not available');
        }
      } catch (e) {
        console.error('Error starting background job:', e);
      }
    } else {
      console.log('Stopping background service');
      try {
        await BackgroundJob.stop();
        console.log('Background service stopped successfully!');
      } catch (e) {
        console.error('Error stopping background job:', e);
      }
    }
    setPlaying(!playing); // Toggle playing state
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
          <View style={styles.body}>
            <TouchableOpacity
              style={{ height: 100, width: 100, backgroundColor: 'red', justifyContent: 'center' }}
              onPress={toggleBackground}
            >
              <Text style={styles.buttonText}>
                {playing ? 'Stop Background Task' : 'Start Background Task'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#F3F3F3',
  },
  body: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default App;
