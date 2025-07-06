import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { FileWithStatus } from '@/types/upload';

/**
 * Upload files to Supabase storage
 */
export async function uploadFilesToStorage(files: FileWithStatus[]) {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('Authentication required for file uploads:', sessionError);
      throw new Error('Authentication required for file uploads');
    }

    const uploadResults = await Promise.all(
      files.map(async (file) => {
        try {
          const filePath = `${session.user.id}/${Date.now()}-${file.name}`;

          const { data, error } = await supabase.storage
            .from('uploads')
            .upload(filePath, file.file, {
              cacheControl: '3600',
              upsert: true,
            });

          if (error) {
            console.error('Error uploading file:', error);
            throw error;
          }

          // Register upload in database
          const { data: uploadData, error: dbError } = await supabase
            .from('uploads')
            .insert({
              user_id: session.user.id,
              file_name: file.name,
              file_type: file.type,
              file_path: data.path,
              status: 'processando',
            })
            .select('id')
            .single();

          if (dbError) {
            console.error('Error registering upload in database:', dbError);
            throw dbError;
          }

          return {
            id: uploadData.id,
            name: file.name,
            type: file.type,
          };
        } catch (uploadError) {
          console.error('Error in file upload:', uploadError);
          return {
            id: `error-${Date.now()}`,
            name: file.name,
            error: uploadError.message || 'Upload failed',
          };
        }
      })
    );

    return uploadResults.filter((result) => !('error' in result));
  } catch (error) {
    console.error('Error in uploadFilesToStorage:', error);
    throw error;
  }
}
