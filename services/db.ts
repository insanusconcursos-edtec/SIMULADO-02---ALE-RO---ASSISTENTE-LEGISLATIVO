
import { Submission, AnswerOption, Appeal, QuestionMetadata } from '../types';
import { DEFAULT_ADMIN_ANSWERS } from '../constants';
import { db } from './firebase';

export interface DBState {
  submissions: Submission[];
  adminAnswers: Record<number, AnswerOption>;
  appeals: Appeal[];
  appealDeadline: string;
  formTitle: string;
  // New Fields
  editalTopics: Record<string, string[]>; // Key is Discipline Name, Value is list of topics
  questionMetadata: Record<number, QuestionMetadata>;
}

const docRef = db.collection("appState").doc("singleton");

export const defaultState: DBState = {
  submissions: [],
  adminAnswers: DEFAULT_ADMIN_ANSWERS,
  appeals: [],
  appealDeadline: '',
  formTitle: 'SIMULADO 01 - ALE RO - ASSISTENTE LEGISLATIVO (RANKING)',
  editalTopics: {},
  questionMetadata: {},
};

export const getData = async (): Promise<DBState> => {
  try {
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      // Merge with default state to handle schema changes gracefully
      const data = docSnap.data() as DBState;
      return { 
          ...defaultState, 
          ...data,
          // Ensure new fields exist if merging from old DB version
          editalTopics: data.editalTopics || {},
          questionMetadata: data.questionMetadata || {}
      };
    } else {
      // Document doesn't exist, so initialize it with the default state
      console.log("No document found in Firestore. Initializing with default state.");
      await setData(defaultState);
      return defaultState;
    }
  } catch (error) {
    console.error("Failed to read from Firestore, using default state.", error);
    // Provide default state on error to prevent app crash
    return { ...defaultState };
  }
};

export const setData = async (data: DBState): Promise<void> => {
  try {
    await docRef.set(data);
  } catch (error) {
    console.error("Failed to write to Firestore.", error);
    // Re-throw the error so the UI can notify the user
    throw error;
  }
};
