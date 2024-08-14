import { GoogleAndroidClientId, GoogleIosClientId, GoogleWebClientId } from '../env/env';
import React, { useEffect} from 'react';
import { View, StyleSheet, Alert, Text, StatusBar, Image} from 'react-native';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { Appbar } from 'react-native-paper';

export default function ErrorScreen({ navigation }) {
    
    const backScreenNavigation = () => {
        navigation.navigate('Home');
    };

    const configureGoogleSignIn = () => {
        GoogleSignin.configure({
            webClientId: GoogleWebClientId,
            androidClientId: GoogleAndroidClientId,
            iosClientId: GoogleIosClientId,
            scopes: ['https://www.googleapis.com/auth/drive'],
        });
    };

    const handleGoogleSignIn = async () => {
        try {
            const isSignedIn = await GoogleSignin.isSignedIn();
            if (isSignedIn) {
                navigation.navigate('HomeGaleria');
            } else {
                await GoogleSignin.signIn();
                navigation.navigate('HomeGaleria');
            }
        } catch (error) {
            Alert.alert('Login efetuado com sucesso!');
            navigation.navigate('HomeGaleria');
        }
    };

    useEffect(() => {
        configureGoogleSignIn();
    }, []);

    return (
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" />
          <Appbar.Header style={styles.appbarHeader}>
            <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
            <Appbar.Content title="Login" titleStyle={styles.appbarTitle} />
            <Appbar.Action icon="home" onPress={backScreenNavigation} color="#fff"/>
        </Appbar.Header>
          <View style={styles.separator} />
          <View style={styles.centerContainer}>
            <View style={styles.contentContainer}>
                <Image source={require('../../assets/escritoGoogle.png')} style={styles.iconImage} />
                <Text style={styles.instructionText}>Login</Text>
                <GoogleSigninButton
                    style={styles.googleButton}
                    color={GoogleSigninButton.Color.Dark}
                onPress={handleGoogleSignIn}
                />
            </View>
          </View>
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#fff', 
      },
      appbarHeader: {
        backgroundColor: '#1E3C40', // Cor de fundo do Appbar
      },
      appbarTitle: {
        color: '#fff', // Cor do texto no Appbar
      },
      separator: {
        height: 4, // Espessura da linha
        backgroundColor: '#1E3C40', // Cor da linha (ajuste conforme necessário)
      },
      centerContainer: {
        flex: 1,
        backgroundColor: '#fff', 
        justifyContent: 'center', // Centraliza verticalmente
        alignItems: 'center', // Centraliza horizontalmente
      },
      contentContainer: {
        width: '80%', // Ajuste conforme necessário
        height: '80%',
        padding: 20,
        borderWidth: 10, // Espessura da borda
        borderColor: '#1E3C40', // Cor da borda (azul do Google)
        borderRadius: 15, // Arredonda os cantos, se desejado
        alignItems: 'center', // Centraliza o conteúdo dentro do container
        backgroundColor: '#fff', // Cor de fundo para o container
        justifyContent: 'center',
        overflow: 'hidden',
        bottom: 20,
        paddingBottom: 20,
      },
      iconButton: {
        backgroundColor: '#ffffff',
        borderRadius: 50,
        padding: 10,
        elevation: 3,
        marginBottom: 20,
      },
      iconImage: {
        width: 150,
        height: 150,
        marginBottom: 50,
      },
      instructionText: {
        fontSize: 28,
        marginBottom: 10,
        textAlign: 'center',
        color: '#1E3C40',
      },
      googleButton: {
        width: 250,
        height: 60,
        marginBottom: 150,
      },
    });
