// uplord.js
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast } from 'react-toastify';

const uplord = async (file) => {
    const storage = getStorage();
    const storageRef = ref(storage, `images/${Date.now() + file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        // Create initial toast
        const toastId = toast.loading("Starting upload...");

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                
                // Update toast with current progress
                toast.update(toastId, { 
                    render: `Upload Progress: ${Math.round(progress)}%`,
                    type: 'info',
                    isLoading: true
                });

                switch (snapshot.state) {
                    case 'paused':
                        toast.update(toastId, { 
                            render: 'Upload is paused',
                            type: 'warning',
                            isLoading: true
                        });
                        break;
                    case 'running':
                       
                        break;
                }
            },
            (error) => {
                // Handle unsuccessful uploads
                toast.update(toastId, {
                    render: 'Upload failed!',
                    type: 'error',
                    isLoading: false,
                    autoClose: 3000
                });
                reject(error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    // Show success message
                    toast.update(toastId, {
                        render: 'Upload completed successfully!',
                        type: 'success',
                        isLoading: false,
                        autoClose: 2000
                    });
                    resolve(downloadURL);
                });
            }
        );
    })
};

export default uplord;