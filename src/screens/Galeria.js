import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar, Pressable, Image, Button, Alert, TextInput, Modal, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import * as ImagePicker from 'expo-image-picker';
import { GDrive, MimeTypes } from "@robinbobin/react-native-google-drive-api-wrapper";
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import RNFS from 'react-native-fs';
import { GoogleAndroidClientId, GoogleIosClientId, GoogleWebClientId } from '../env/env';

export default function Galeria({ navigation }) {
    const [photos, setPhotos] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [showSaveOptions, setShowSaveOptions] = useState(false); 
    const [selectedAssets, setSelectedAssets] = useState([]);
    const [imageNames, setImageNames] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showNameModal, setShowNameModal] = useState(false);
    const [imageName, setImageName] = useState('');
    const [currentImageUri, setCurrentImageUri] = useState('');
    const [showActionButtons, setShowActionButtons] = useState(true);

    const backScreenNavigation = () => {
        navigation.navigate('Home');
    };
    
    const driveSaveHandler = async (assets) => {
        if (!assets || assets.length === 0) {
            Alert.alert('Erro', 'Nenhuma imagem foi selecionada para salvar.');
            return;
        }
        try {
            const gdrive = new GDrive();
            const tokens = await GoogleSignin.getTokens();
            gdrive.accessToken = tokens.accessToken;
            gdrive.fetchTimeout = 5000;
    
            for (const [index, asset] of assets.entries()) {
                const filePath = asset.uri;
                const fileName = imageNames[index] || `${filePath.split('/').pop().split('.').slice(0, -1).join('')}_no_label_image`; // Garante que o nome inclui o sufixo
    
                let res;
                try {
                    res = await RNFS.readFile(filePath, 'base64');
                } catch (readError) {
                    console.log("Error reading file: ", readError);
                    Alert.alert('Erro', `Erro ao ler a imagem: ${filePath}`);
                    continue;
                }
    
                console.log('Saving file with name:', fileName); 
    
                Alert.alert('Drive', `Salvando imagem ${fileName} no Drive...`);
    
                try {
                    await gdrive.files.newMultipartUploader()
                        .setData(res, MimeTypes.JPG)
                        .setIsBase64(true)
                        .setRequestBody({
                            name: fileName,
                            parents: ["1r-R8_LVQfA0sfk2i-ifKVipThMKs9cQF"]
                        })
                        .execute();
                } catch (uploadError) {
                    console.log("Error uploading image to Google Drive: ", uploadError);
                    Alert.alert('Erro', `Erro ao salvar a imagem ${fileName} no Drive.`);
                    continue;
                }
            }
    
            Alert.alert('Drive', 'Imagens salvas no Drive com sucesso!');
        } catch (e) {
            console.log("Error with Google Drive or tokens. Error message: " + e);
            Alert.alert('Erro', 'Erro ao acessar o Google Drive.');
        }
    };
    
    const getAllPhotos = async () => {
        try {
            const r = await CameraRoll.getPhotos({
                first: 1000,
                assetType: 'Photos', 
            });
    
            setPhotos(r.edges); 
        } catch (err) {
            console.log(err);
        }
    };
    
    const pickImages = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Desculpe, precisamos de permissões para acessar sua galeria!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 10,
        });

        if (!result.canceled && result.assets.length > 0) {
            console.log('Selected assets:', result.assets);  
            setSelectedAssets(result.assets);
            setImageNames(new Array(result.assets.length).fill(''));
            setCurrentImageIndex(0);
            setCurrentImageUri(result.assets[0].uri);
            setShowNameModal(true);
            setShowActionButtons(false);
        } 
    };

    const handleSaveOptions = (option) => { 
        setShowSaveOptions(false);
        setShowActionButtons(true);
        if (option === 'drive' && selectedAssets.length > 0) {
            driveSaveHandler(selectedAssets);
        } else {
            Alert.alert('Erro', 'Nenhuma imagem selecionada.');
        }
    };

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
            Alert.alert('Info', JSON.stringify(info));
        } catch (e) {
            if (e.code === statusCodes.SIGN_IN_REQUIRED) {
                Alert.alert('Erro', 'O login é necessário');
            } else {
                Alert.alert('Erro', 'ERRO: ' + JSON.stringify(e));
            }
        }
    };

    const handleNameSubmit = () => {
        const updatedNames = [...imageNames];
        const newName = `${imageName}_no_label_image`;
        updatedNames[currentImageIndex] = newName;
        setImageNames(updatedNames);
        setImageName('');
    
        console.log('Updated image names:', updatedNames); 
    
        if (currentImageIndex < selectedAssets.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
            setCurrentImageUri(selectedAssets[currentImageIndex + 1].uri);
        } else {
            setShowNameModal(false);
            setShowSaveOptions(true);
        }
    };
    
    useEffect(() => {
        getAllPhotos();
        configureGoogleSignIn();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            {showActionButtons && (
                <View style={styles.botoesContainer}>
                    <Pressable style={styles.botao} onPress={pickImages}>
                        <Text style={styles.textbotao}>Selecionar Imagens</Text>
                    </Pressable>
                    <Pressable style={styles.botao} onPress={backScreenNavigation}>
                        <Text style={styles.textbotao}>Voltar ao Inicio</Text>
                    </Pressable>
                </View>
            )}
            <Modal visible={showNameModal} transparent={true} animationType="slide">
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardAvoidingContainer}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 30}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.imageWrapper}>
                                <View style={styles.textContainer}>
                                    <Image source={{ uri: currentImageUri }} style={styles.image} />
                                </View>
                            </View>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Digite o nome da imagem"
                                value={imageName}
                                onChangeText={setImageName}
                            />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 0 }}>
                                <Pressable style={styles.botao} onPress={() => setShowNameModal(false)}>
                                    <Text style={styles.textbotao}>Voltar</Text>
                                </Pressable>
                                <Pressable style={styles.botao} onPress={handleNameSubmit}>
                                    <Text style={styles.textbotao}>Salvar</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
            <Modal visible={showSaveOptions} transparent={true}>
                <View style={styles.modal}>
                    <Pressable style={styles.botao} onPress={() => handleSaveOptions('drive')}>
                        <Text style={styles.textbotao}>Salvar Google Drive</Text>
                    </Pressable>
                    <Pressable style={styles.botao} onPress={() => {setShowSaveOptions(false);setShowActionButtons(true);}}>
                        <Text style={styles.textbotao}>Cancelar</Text>
                    </Pressable>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    cameraContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    imageThumbnail: {
        width: 100,
        height: 100,
        margin: 5,
    },
    botoesContainer: {
        width: '100%',
        marginTop: 250,
        //alignItems: 'center',
    },
    modal: {
        flex: 1,
        justifyContent: 'center',
        //alignItems: 'center',
        backgroundColor: 'transparent',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        
    },
    modalContent: {
        width: '90%', 
        height: '75%', 
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 5, 
        borderColor: '#1E3C40',
    },
    imageWrapper: {
        alignItems: 'center',
        marginBottom: 20,
    },
    image: {
        width: 300,
        height: 300,
    },
    imageText: {
        fontSize: 15,            
        color: 'white',          
        fontWeight: 'bold',      
        textAlign: 'center',    
    },
    textContainer: {
       backgroundColor: '#1E3C40', 
        padding: 5,             
        borderRadius: 10,         
        marginBottom: 10,        
    },
    textInput: {
        width: '100%',
        borderWidth: 2, 
        borderColor: '#1E3C40', 
        borderRadius: 10, 
        marginBottom: 20,
        padding: 10,
        color: 'black', 
        fontSize: 18,  
    },
    botao: {
        backgroundColor: '#1E3C40',
        padding: 20,
        margin: 15,
        alignContent: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    text: {
        color: 'white',             
        fontSize: 16,               
    },
    textbotao: {
        color: '#fff',
        fontFamily: 'Roboto',
        textAlign: 'center',
        fontSize: 17,
        fontWeight: 'bold',
    },
    googleButton: {
        width: 192,
        height: 48,
        marginBottom: 20,
    },
    keyboardAvoidingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }  
});
