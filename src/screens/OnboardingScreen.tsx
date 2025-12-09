import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Dimensions,
    TouchableOpacity,
    SafeAreaView,
    Image,
    StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface Slide {
    id: string;
    title: string;
    description: string;
    icon: any;
}

const slides: Slide[] = [
    {
        id: '1',
        title: 'Bem-vindo ao Organia+',
        description: 'Descubra uma nova forma de organizar sua vida. O Organia+ une simplicidade e elegância para que você foque no que realmente importa: realizar seus objetivos, um dia de cada vez.',
        icon: require('../assets/Tela1.png'),
    },
    {
        id: '2',
        title: 'Agenda Visual e Intuitiva',
        description: 'Gerencie seus compromissos com clareza total. Com diferenciação por cores e uma interface limpa, você visualiza seu dia num piscar de olhos e nunca mais perde um horário importante.',
        icon: require('../assets/Tela2.png'),
    },
    {
        id: '3',
        title: 'Produtividade por Energia',
        description: 'Não somos máquinas. Classifique suas tarefas pelo esforço (Leve, Média ou Pesada). Nos dias cansativos, filtre apenas o que é "Leve"; nos dias bons, vá com tudo. Respeite seu ritmo e evite o burnout.',
        icon: require('../assets/Tela3.png'),
    },
];

interface OnboardingScreenProps {
    onFinish: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
    const { colors } = useTheme();
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const ref = useRef<FlatList>(null);

    const updateCurrentSlideIndex = (e: any) => {
        const contentOffsetX = e.nativeEvent.contentOffset.x;
        const currentIndex = Math.round(contentOffsetX / width);
        setCurrentSlideIndex(currentIndex);
    };

    const goToNextSlide = () => {
        const nextSlideIndex = currentSlideIndex + 1;
        if (nextSlideIndex !== slides.length) {
            const offset = nextSlideIndex * width;
            ref?.current?.scrollToOffset({ offset });
            setCurrentSlideIndex(nextSlideIndex);
        }
    };

    const handleFinish = async () => {
        try {
            await AsyncStorage.setItem('hasSeenOnboarding', 'true');
            onFinish();
        } catch (error) {
            console.error('Error saving onboarding status:', error);
            onFinish();
        }
    };

    const Slide = ({ item }: { item: Slide }) => {
        return (
            <View style={{ width, alignItems: 'center', padding: 20 }}>
                <Image
                    source={item.icon}
                    style={{
                        height: height * 0.5,
                        width,
                        resizeMode: 'contain',
                        marginTop: 20,
                        marginBottom: 10
                    }}
                />
                <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{item.description}</Text>
            </View>
        );
    };

    const Footer = () => {
        return (
            <View style={{
                height: height * 0.20,
                justifyContent: 'space-between',
                paddingHorizontal: 20,
            }}>
                {/* Indicators */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginTop: 20,
                }}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.indicator,
                                currentSlideIndex === index && {
                                    backgroundColor: colors.primary,
                                    width: 25,
                                },
                                currentSlideIndex !== index && {
                                    backgroundColor: colors.border,
                                }
                            ]}
                        />
                    ))}
                </View>

                {/* Buttons */}
                <View style={{ marginBottom: 20 }}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: currentSlideIndex === slides.length - 1 ? 'center' : 'space-between'
                    }}>
                        {currentSlideIndex !== slides.length - 1 && (
                            <>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={handleFinish}
                                    style={[styles.btn, {
                                        borderColor: colors.border,
                                        borderWidth: 1,
                                        backgroundColor: 'transparent',
                                    }]}>
                                    <Text style={{
                                        fontWeight: 'bold',
                                        fontSize: 15,
                                        color: colors.textSecondary,
                                    }}>
                                        Pular
                                    </Text>
                                </TouchableOpacity>
                                <View style={{ width: 15 }} />
                            </>
                        )}

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={currentSlideIndex === slides.length - 1 ? handleFinish : goToNextSlide}
                            style={[styles.btn, {
                                backgroundColor: colors.primary,
                                // On last slide: remove flex, set specific width to match the columns
                                ...(currentSlideIndex === slides.length - 1 && {
                                    flex: 0,
                                    width: (width - 40 - 15) / 2, // (Screen - Padding - Gap) / 2
                                })
                            }]}>
                            <Text style={{
                                fontWeight: 'bold',
                                fontSize: 15,
                                color: '#FFF',
                            }}>
                                {currentSlideIndex === slides.length - 1 ? 'Começar' : 'Próximo'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
            <FlatList
                ref={ref}
                onMomentumScrollEnd={updateCurrentSlideIndex}
                contentContainerStyle={{ height: height * 0.75 }}
                showsHorizontalScrollIndicator={false}
                horizontal
                data={slides}
                pagingEnabled
                renderItem={hasIcon => <Slide item={hasIcon.item} />}
            />
            <Footer />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 20,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 10,
        maxWidth: '70%',
        textAlign: 'center',
        lineHeight: 23,
    },
    indicator: {
        height: 2.5,
        width: 10,
        backgroundColor: 'grey',
        marginHorizontal: 3,
        borderRadius: 2,
    },
    btn: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default OnboardingScreen;
