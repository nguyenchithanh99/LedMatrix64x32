import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  Image,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Toast from 'react-native-root-toast';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';

import saveIcon from '../icons/save.png';
import imageIcon from '../icons/image.png';
import paintIcon from '../icons/paint.png';
import clockIcon from '../icons/clock.png';

export default function main({navigation}) {
  const [ip, setIp] = useState('');
  const [clockStatus, setClockStatus] = useState(false);
  const [slider, setSlider] = useState(1);

  const checkIp = () => {
    Keyboard.dismiss();
    if (!validateIPaddress(ip)) {
      Toast.show('Địa chỉ IP không hợp lệ. Vui lòng kiểm tra lại', {
        position: -20,
        duration: 2500,
      });
    }
  };

  const goToNextScreen = type => {
    if (!validateIPaddress(ip)) {
      Toast.show('Địa chỉ IP không hợp lệ. Vui lòng kiểm tra lại', {
        position: -20,
        duration: 2500,
      });
    } else {
      if (type === 'image') {
        navigation.navigate('Image', {ip: ip});
      } else if (type === 'paint') {
        navigation.navigate('Paint', {ip: ip});
      } else {
        navigation.navigate('Clock', {ip: ip});
      }
    }
  };

  const onSetBrightness = () => {
    if (ip === '') {
      Toast.show('Địa chỉ IP trống. Vui lòng nhập địa chỉ IP', {
        position: -20,
        duration: 2500,
      });
      return;
    }

    fetch('http://' + ip + '/set_brightness', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({brightness: slider}),
    })
      .then(response => response.json())
      .then(response => {
        if (!response.res === 'Success') {
          Toast.show('Thiết lập độ sáng không thành công. Vui lòng thử lại', {
            position: -20,
            duration: 2500,
          });
        }
      })
      .catch(err => {
        console.log(err);
        Toast.show('Thiết lập độ sáng không thành công. Vui lòng thử lại', {
          position: -20,
          duration: 2500,
        });
      });
  };

  const onGetBrightness = () => {
    fetch('http://' + ip + '/get_brightness', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })
      .then(response => response.json())
      .then(response => {
        if (response.res) {
          setSlider(parseInt(response.res) / 10);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const validateIPaddress = ipAddress => {
    if (
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
        ipAddress,
      )
    ) {
      return true;
    }
    return false;
  };

  const storeData = async value => {
    try {
      await AsyncStorage.setItem('@ip', value);
    } catch (e) {}
  };

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('@ip');
      if (value !== null) {
        setIp(value);
      }
    } catch (e) {}
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (validateIPaddress(ip)) {
        onGetBrightness();
        storeData(ip);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [ip]);

  useEffect(() => {
    const timer1s = setTimeout(() => {
      onSetBrightness();
    }, 1500);
    return () => clearTimeout(timer1s);
  }, [slider]);

  useEffect(() => {
    getData();
  }, []);

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerText}>Điều khiển Led Matrix</Text>
      </View>
      <Text style={styles.inputTitle}>Nhập IP ESP8266 Led Matrix</Text>
      <View style={styles.inputCont}>
        <TextInput
          style={styles.input}
          onChangeText={text => setIp(text)}
          value={ip}
          keyboardType="numeric"
          placeholder="IP"
          underlineColorAndroid="transparent"
          autoCapitalize="none"
          onSubmitEditing={event => {
            checkIp();
          }}
        />

        <TouchableOpacity onPress={() => checkIp()}>
          <Image style={styles.inputImage} source={saveIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.setBrightnessCont}>
        <Text style={styles.setBrightnessText}>Thiết lập độ sáng</Text>
        <View style={styles.row}>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={14}
            minimumTrackTintColor="#c45529"
            maximumTrackTintColor="#000000"
            thumbTintColor="#ba562f"
            step={1}
            value={slider}
            onValueChange={value => setSlider(value)}
          />
          <Text style={styles.sliderText}>{slider}</Text>
        </View>
      </View>

      <View style={styles.menuCont}>
        <TouchableOpacity
          style={styles.itemMenu}
          onPress={() => goToNextScreen('clock')}>
          <Image style={styles.itemMenuImg} source={clockIcon} />
          <Text>Đồng hồ</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.menuCont}>
        <TouchableOpacity
          style={styles.itemMenu}
          onPress={() => goToNextScreen('image')}>
          <Image style={styles.itemMenuImg} source={imageIcon} />
          <Text style={styles.itemMenuText}>Hình ảnh</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.itemMenu}
          onPress={() => goToNextScreen('paint')}>
          <Image style={styles.itemMenuImg} source={paintIcon} />
          <Text style={styles.itemMenuText}>Vẽ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const {width, height} = Dimensions.get('window');
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setBrightnessCont: {
    borderColor: '#8a8a8a',
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 32,
    width: width / 1.35,
    alignSelf: 'center',
    paddingVertical: 5,
  },
  setBrightnessText: {
    color: '#ba562f',
    position: 'absolute',
    zIndex: 1,
    top: -12,
    left: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f2f2f2',
  },
  slider: {
    width: width / 1.6,
    height: 40,
  },
  sliderText: {
    width: 25,
    textAlign: 'center',
  },
  menuCont: {
    marginTop: 40,
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  itemMenu: {
    borderColor: '#8a8a8a',
    borderRadius: 5,
    borderWidth: 1,
    width: width / 2.8,
    alignItems: 'center',
    paddingVertical: 10,
  },
  itemMenuImg: {
    width: width / 11,
    height: width / 11,
    marginBottom: 5,
    borderRadius: 5,
  },
  inputImage: {
    width: width / 16,
    height: width / 16,
    marginRight: 10,
  },
  inputCont: {
    borderColor: '#8a8a8a',
    borderRadius: 5,
    borderWidth: 1,
    marginLeft: 10,
    width: width - 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputTitle: {
    color: '#ba562f',
    marginTop: 15,
    marginLeft: 15,
    fontSize: 14,
    marginBottom: -9,
    backgroundColor: '#f2f2f2',
    zIndex: 1,
    width: width / 1.6,
    textAlign: 'center',
  },
  header: {
    width,
    height: height / 17,
    backgroundColor: '#ba562f',
    paddingTop: 4,
  },
  headerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
  input: {
    height: 43,
    color: '#666666',
    fontSize: 14,
    width: width / 2,
    padding: 0,
    paddingLeft: 10,
  },
});
