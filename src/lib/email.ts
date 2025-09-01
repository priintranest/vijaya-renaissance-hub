import { saveToDatabase, type WaitlistData } from './database';

export const submitWaitlistForm = async (data: WaitlistData) => {
  try {
    // Save to database
    const dbResult = await saveToDatabase(data);
    
    if (!dbResult.success) {
      if (dbResult.duplicate) {
        return {
          success: false,
          message: 'This email is already registered in our waitlist',
          duplicate: true
        };
      }
      console.error('Database save failed:', dbResult.message);
      return {
        success: false,
        message: 'Failed to save to database'
      };
    }

    console.log('✅ Successfully saved to database:', dbResult.data);
    
    return { 
      success: true, 
      message: 'Successfully added to waitlist database',
      data: dbResult.data
    };
  } catch (error) {
    console.error('Form submission failed:', error);
    return { success: false, message: 'Failed to submit form', error };
  }
};
