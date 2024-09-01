import React, { useState, useRef } from 'react';
import { View, Text, Dimensions, Image, StyleSheet } from 'react-native';
import { Modal, ModalBackdrop, ModalContent } from "@/components/ui/modal";
import { Button, ButtonText } from "@/components/ui/button";
import Carousel from 'react-native-reanimated-carousel';
import colors from '@/styles/COLORS';

export default function WelcomeModal({
    isOpen,
    onClose
}) {
    const { width, height } = Dimensions.get('window');
    const data = [
        { title: "Welcome to T-Vault!", description: "The ultimate app for storing and sharing your trips!", image: require('../assets/logo_transparent_bg.png') },
        { title: "Create Your Trips", description: "Document all your adventures and memories with ease!", image: require('../assets/welcome/0.gif') },
        { title: "Store Your Stories", description: "Edit your trips and add details to remember every moment.", image: require('../assets/welcome/0.gif') },
        { title: "Share Your Trips", description: "Share your adventures with friends or collaborate on them with loved ones.", image: require('../assets/welcome/0.gif') },
        { title: "Explore the World", description: "Discover new places by viewing trips shared by others.", image: require('../assets/welcome/0.gif') },
        { title: "Show Trips on Map", description: "Visualize your trips or shared trips on a map for a better perspective.", image: require('../assets/welcome/0.gif') },
        { title: "Start the Adventure!", description: "Create your first trip and embark on your adventure today!", image: require('../assets/welcome/0.gif') }
    ];    
    const carouselRef = useRef(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [gifKey, setGifKey] = useState(0);

    const closeModal = () => {
        onClose();
    }

    const handleNext = () => {
        if (currentIndex < data.length - 1) {
            carouselRef.current?.scrollTo({ index: currentIndex + 1, animated: true });
            setCurrentIndex(currentIndex + 1);
        } else {
            closeModal();
        }
    };
    
    const handlePrevious = () => {
        if (currentIndex > 0) {
            carouselRef.current?.scrollTo({ index: currentIndex - 1, animated: true });
            setCurrentIndex(currentIndex - 1);
        }
    };     

    return (
        <Modal isOpen={isOpen} onClose={closeModal}>
            <ModalBackdrop />
            <ModalContent style={styles.modalContent}>
                <View style={styles.contentContainer}>
                    <Carousel
                        ref={carouselRef}
                        width={width}
                        data={data}
                        renderItem={({ index }) => (
                            <View style={styles.carouselItem}>
                                <Image 
                                    source={data[index].image} 
                                    style={styles.image}
                                    resizeMode='contain'
                                    key={`image-${gifKey}`}
                                />
                                <View style={styles.textContainer}>
                                    <Text style={styles.title}>{data[index].title}</Text>
                                    <Text style={styles.description}>{data[index].description}</Text>
                                </View>
                            </View>
                        )}
                        onSnapToItem={index => {
                            setCurrentIndex(index);

                            // This will update the key of the GIF to force it to re-render
                            setGifKey(prevKey => prevKey + 1); 
                        }}
                        loop={false}
                        pagingEnabled
                    />
                    <View style={styles.buttonContainer} >
                        <Button onPress={handlePrevious} style={styles.button} variant='outline' size='lg' isDisabled={currentIndex == 0}>
                            <ButtonText>Previous</ButtonText>
                        </Button>
                        <Button onPress={handleNext} style={styles.button} variant={currentIndex == data.length - 1 ? 'solid' : 'outline'} size='lg'>
                            <ButtonText>{currentIndex == data.length - 1 ? "Let's trip !" : "Next"}</ButtonText>
                        </Button>
                    </View>
                </View>
            </ModalContent>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        flex: 1,
        maxHeight: '75%',
        backgroundColor: colors.background_dark,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    carouselItem: {
        display: 'flex',
        flex: 1,
        backgroundColor: colors.background_dark,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
    image: {
        width: '75%',
        height: '100%',
        flex: 5,
    },
    textContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white'
    },
    description: {
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
        marginHorizontal: 50,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%'
    },
    button: {
        flex: 1,
        marginHorizontal: 10,
    },
});
