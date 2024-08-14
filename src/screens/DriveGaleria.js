import React, {useEffect, useState} from 'react';
import { View, Text, StyleSheet, StatusBar, Pressable, FlatList, Image, Button, Alert} from 'react-native';
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import {
    GDrive
  } from "@robinbobin/react-native-google-drive-api-wrapper";
import {
    GoogleSignin,
    GoogleSigninButton,
} from '@react-native-google-signin/google-signin';
var fs = require('react-native-fs');
import { GoogleAndroidClientId, GoogleIosClientId, GoogleWebClientId } from '../env/env';
import RNFS from 'react-native-fs';

export default function GaleriaDrive({ navigation }) {

    const [photos, setPhotos] = useState([]);
    const [buttonMode, setButtonMode] = useState("off");
    const [clickedIndex, setClickedIndex] = useState('');
    const [clickedImage, setClickedImage] = useState('');
    const [error, setError] = useState(null);
    const [userInfo, setUserInfo] = useState([]);
    const [reload, setReload] = useState(false);
    const [labeled, setLabeled] = useState(0);

    const backScreenNavigation = () => {
        navigation.navigate('Home');
    };

    const buttonHandler = (index) => {
        if(buttonMode == "off"){
            setButtonMode("on");
            setClickedIndex(index);
            setClickedImage(photos[index].node.image.uri);
        } else {
            setButtonMode("off");
            setClickedIndex(null);
        }
    }

    const reloadHandler = async() => {
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (!isSignedIn) {
            // Navega para a tela de erro se não estiver logado
            navigation.navigate('ErrorScreen');
            return;
        }
        Alert.alert('Drive', 'Estamos baixando as imagens do drive. Aguarde um momento!')
        await getAllPhotosFromDrive();
        setReload(true);
        Alert.alert('Drive', 'Imagens baixadas com sucesso!')
    }

    const driveButton = () => {
        if (Platform.OS === 'android') {
            Alert.alert('Drive', 'Deseja salvar a imagem no drive?', [
                {text: 'Sim', onPress: () => driveHandler()},
                {text: 'Não', onPress: () => console.log('Cancelado')},
            ]);
        }
    };

    const editButton = async () => {
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (!isSignedIn) {
            // Navega para a tela de erro se não estiver logado
            navigation.navigate('ErrorScreen');
            return;
        }
        
        let img = photos[clickedIndex].node.image.uri;

        // Convert content URI to file path
        const filePath = await RNFS.stat(img)
            .then((statResult) => {
                return statResult.originalFilepath;
            })
            .catch((err) => {
                console.error('Error: ', err.message, err.code);
            });

        const fileUri = `file://${filePath}`;
        navigation.navigate('Edit', { imageSource: fileUri });
    };

    const deleteConfirm = () => {
        Alert.alert('Deletar', 'Deseja deletar a imagem?', [
            {text: 'Sim', onPress: () => deleteHandler()},
            {text: 'Não', onPress: () => console.log('Cancelado')},
        ]);
    }

    const deleteHandler = async () => {
        let img = photos[clickedIndex].node.image.uri;

        // Convert content URI to file path
        const filePath = await RNFS.stat(img)
            .then((statResult) => {
                return statResult.originalFilepath;
            })
            .catch((err) => {
                console.error('Error: ', err.message, err.code);
            });

        const fileUri = `file://${filePath}`;

        // Delete the image from the device
        await RNFS.unlink(fileUri)
            .then(() => {
                console.log('Image deleted');
            })
            .catch((err) => {
                console.error(err);
            });

        // Delete the image from document directory
        const fileName = fileUri.split('/').pop();
        const folderUri = `${FileSystem.documentDirectory}`+"driveferidas/";
        const fileUriToDelete = `${folderUri}${fileName}`;
        await FileSystem.deleteAsync(fileUriToDelete, {idempotent: true});


        // Reload the gallery
        getAllPhotos();
    }

    const verifyIfLabelExists = async () => {
        // Initialize Google Drive
        const gdrive = new GDrive();
        gdrive.accessToken = (await GoogleSignin.getTokens()).accessToken;
        gdrive.fetchTimeout = 3000;

        // List the files in the specified folder on Drive
        const filesResponse = await gdrive.files.list({
            q: `'1t3K3hcqsETutFxxGHwPGF5DJ4czLDGfH' in parents`,
            fields: 'files(id, name, mimeType)',
        });

        // Extract only the files from the response
        const filesFromDirectory = filesResponse.files;

        // Filter only the images
        const imageFromDirectory = filesFromDirectory.filter(file => file.mimeType.startsWith('image/'));
        
        // Convert content URI to file path
        const filePath = await RNFS.stat(clickedImage)
            .then((statResult) => {
                return statResult.originalFilepath;
            })
            .catch((err) => {
                console.error('Error: ', err.message, err.code);
            });

        const fileUri = filePath.split('/').pop();
        const fileName = fileUri.split('.')[0];
        console.log(fileName);
        const imageName = fileName.split('_')[0];
        console.log(imageName);

        // Verify if the image is already in the Drive
        // const imageExists = imageFromDirectory.filter(file => file.name === imageName);
        // if (imageExists.length > 0) {
        //     setLabeled(1);
        // } else {
        //     setLabeled(2);
        // }
    };

    const getAllPhotosFromDrive = async () => {
        // Initialize Google Drive
        const gdrive = new GDrive();
        try {
            gdrive.accessToken = (await GoogleSignin.getTokens()).accessToken;
            gdrive.fetchTimeout = 3000;
        } catch (error) {
            // Not singed in error
                Alert.alert('Erro', 'Você precisa estar logado para acessar o Drive');
                setError(error);
        }
        
        // no_label folder id
        const directoryId = '1r-R8_LVQfA0sfk2i-ifKVipThMKs9cQF';
        // List the files in the specified folder on Drive
        const filesResponse = await gdrive.files.list({
            q: `'${directoryId}' in parents`,
            fields: 'files(id, name, mimeType)',
        });
        // Extract only the files from the response
        const filesFromDirectory = filesResponse.files;
    
        // Filter only the images
        const imageFromDirectory = filesFromDirectory.filter(file => file.mimeType.startsWith('image/'));
        Alert.alert('Drive', 'Baixando imagens');
        if (imageFromDirectory.length > 0) {
            // Download the images

            for (let i = 0; i < imageFromDirectory.length; i++) {
                const imageId = imageFromDirectory[i].id;
                const imageName = imageFromDirectory[i].name;
                const imageMimeType = imageFromDirectory[i].mimeType;
                const imageData = await gdrive.files.getBinary(imageId);

                
                console.log(imageName);
                const imageDataBase64 = Buffer.from(imageData, 'binary').toString('base64');
    


                // Crate a new folder in the phone's directory if it doesn't exist
                const folderUri = `${FileSystem.documentDirectory}`+"driveferidas/";
                await FileSystem.makeDirectoryAsync(folderUri, {intermediates: true});


                // Uri of the image on the phone (saving in the phone's directory)
                const fileExtension = imageMimeType.split('/')[1];
                const fileUri = `${folderUri}${imageName}.${fileExtension}`;

                // Verify if the phone already has the image 
                const fileExists = await FileSystem.getInfoAsync(fileUri);
                if (fileExists.exists) {
                    continue;
                }
    
                // Saving the image on the phone
                await FileSystem.writeAsStringAsync(fileUri, imageDataBase64, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                // Ensure the file has a valid image MIME type before saving to CameraRoll
                console.log(fileUri.mimeType);
                // if (imageFromDirectory[i].mimeType.startsWith('image/')) {
                //     await CameraRoll.saveAsset(fileUri, { type: 'photo', album: 'DriveFeridas' });
                // }
                CameraRoll.saveAsset(fileUri, {type: 'photo', album: 'DriveFeridas'});
            }
        } else {
            console.log('No images found in the specified directory.');
        }
    };

    const getAllPhotos = async () => {
        CameraRoll.getPhotos({
            first: 1000,
            assetType: 'Photos',
            groupName: 'DriveFeridas',
          })
          .then(r => {
            setPhotos(r.edges);
          })
          .catch((err) => {
            console.log(err);
          });
    };

    const getAllFoldersFromDrive = async () => {
        // Initialize Google Drive
        const gdrive = new GDrive();
        gdrive.accessToken = (await GoogleSignin.getTokens()).accessToken;
        gdrive.fetchTimeout = 3000;

        // List the folders on Drive
        const foldersResponse = await gdrive.files.list({
            q: "mimeType='application/vnd.google-apps.folder'",
            fields: 'files(id, name, mimeType)',
        });

        // Extract only the folders from the response
        const folders = foldersResponse.files;
        console.log(folders);
    }


    //Google Sign In
    const configureGoogleSignIn = () => {
        GoogleSignin.configure({
            webClientId: GoogleWebClientId,
            androidClientId: GoogleAndroidClientId,
            iosClientId: GoogleIosClientId,
            scopes: ['https://www.googleapis.com/auth/drive'],
        });
    };

    const checkIsSignedIn = async () => {
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (isSignedIn) {
            const userInfo = await GoogleSignin.getCurrentUser();
            setUserInfo(userInfo);
        }
    };

    const signIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const info = await GoogleSignin.signIn();
            setUserInfo(info);
            Alert.alert('Login efetuado com sucesso!');
        } catch (e) {
            Alert.alert('Erro', 'Erro ao fazer login: ' + JSON.stringify(e));
        }
    };
    
    const logOut = async () => {
        try{
            console.log("Log out");
            await GoogleSignin.revokeAccess();
            await GoogleSignin.signOut();
            setUserInfo(null);
        } catch(e){
            console.log(e);
            Alert.alert('Erro', 'Erro ao fazer logout: ' + JSON.stringify(e));
        }
    };

    useEffect(() => {
        getAllPhotos();
        checkIsSignedIn();
        configureGoogleSignIn();
    }, []);

    useEffect(() => {
        if(reload){
            getAllPhotos();
            setReload(false);
        }
    }, [reload]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.fotosContainer}>
                <FlatList  data={photos} horizontal={false} numColumns={2} renderItem={({item, index})=>{
                    return(
                        <View style={styles.listaFotos}>
                            <Pressable onPress={() => buttonHandler(index)}>
                            <Image source={{uri: item.node.image.uri}} style={{width: 184, height: 184}}/>
                            {buttonMode === "on" && clickedIndex === index && (
                                <View style={{flexDirection: 'row'}}>
                                    <Pressable style={styles.botaoIcon} onPress={editButton}>
                                        <Image source={require('../../assets/draw.png')} style={{width: 24, height: 24}}/>
                                    </Pressable>
                                    <Pressable style={styles.botaoIcon} onPress={deleteConfirm}>
                                        <Image source={require('../../assets/trash.png')} style={{width: 24, height: 24}}/>
                                    </Pressable>
                                    {/* {labeled === 0 && (
                                    <Pressable style={styles.botaoCloud} onPress={verifyIfLabelExists}>
                                        <Image source={require('../../assets/reload.png')} style={{width: 24, height: 24}}/>
                                    </Pressable>
                                    )}
                                    {labeled === 1 && (
                                    <Pressable style={styles.botaoCloud}>
                                        <Image source={require('../../assets/cloud.png')} style={{width: 24, height: 24}}/>
                                    </Pressable>
                                    )}
                                    {labeled === 2 && (
                                    <Pressable style={styles.botaoCloud}>
                                        <Image source={require('../../assets/cloud-off.png')} style={{width: 24, height: 24}}/>
                                    </Pressable>
                                    )} */}
                                </View>
                                

                            )}
                            </Pressable>
                            
                        </View>
                    )
                }}/>
             </View>
            <View style={styles.botoesContainer}>
                <Pressable style={styles.botao} onPress={backScreenNavigation}>
                    <Image source={require('../../assets/home.png')} style={{width: 30, height: 30}}/>
                </Pressable>
                <Pressable style={styles.botao} onPress={reloadHandler}>
                    <Image source={require('../../assets/reload.png')} style={{width: 30, height: 30}}/>
                </Pressable>
                {userInfo && userInfo.user ? (
                    <Button title="Logout" onPress={logOut}/>   
                ) : (
                    <GoogleSigninButton style={styles.botaoGoogle} color={GoogleSigninButton.Color.Dark} onPress={signIn} />
                )}
            
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    text : {
        fontSize: 20,
    },
    titulo: {
        paddingTop: 95,
        paddingBottom: 50,
        fontSize: 37,
        fontWeight: 'bold',
        color: '#698C8C',
    },
    botoesContainer: {
        width: '100%',
        margin: 3,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    botao: {
        backgroundColor: '#1E3C40',
        padding: 10,
        margin: 15,
        alignContent: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    textbotao: {
        color: '#fff',
        fontSize: 20,
        textAlign: 'center',
    },
    listaFotos: {
        padding: 5,
    },
    fotosContainer: {
        width: '100%',
        height: '88%',
        alignItems: 'center',
        position: 'relative',
        backgroundColor: '#dfe1e6',
    },
    botaoIcon: {
        padding: 2,
        backgroundColor: '#1E3C40',
        // borderRightColor: 'black',
        // borderRightWidth: 1,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    botaoCloud: {
        padding: 2,
        backgroundColor: 'red',
        // borderRightColor: 'black',
        // borderRightWidth: 1,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    botaoGoogle: {
        width: '40%',
        size: GoogleSigninButton.Size.Wide,
        padding: 10,
        margin: 10,
        alignContent: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    }
    
});