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
import React, {useState} from 'react';
import Toast from 'react-native-root-toast';

import saveIcon from '../icons/save.png';
import imageIcon from '../icons/image.png';
import paintIcon from '../icons/paint.png';
import clockIcon from '../icons/clock.png';
import swichLeft from '../icons/toggle.png';
import swichRight from '../icons/toggle2.png';

export default function main({navigation}) {
  const [ip, setIp] = useState('');
  const [clockStatus, setClockStatus] = useState(false);

  const checkIp = () => {
    Keyboard.dismiss();
    if (ip === '') {
      Toast.show('Địa chỉ IP trống, vui lòng kiểm tra lại', {
        position: 0,
        duration: 2500,
      });
    }
  };

  const goToNextScreen = type => {
    if (ip === '') {
      Toast.show('Địa chỉ IP trống, vui lòng kiểm tra lại', {
        position: 0,
        duration: 2500,
      });
    } else {
      if (type === 'image') {
        navigation.navigate('Image', {ip: '192.168.1.' + ip});
      } else if (type === 'paint') {
        navigation.navigate('Paint', {ip: '192.168.1.' + ip});
      } else {
        navigation.navigate('Clock', {ip: '192.168.1.' + ip});
      }
    }
  };

  const swichClock = status => {
    Keyboard.dismiss();
    fetch('http://192.168.1.' + ip + '/swich', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: status,
      }),
    })
      .then(response => response.json())
      .then(response => {
        if (response.res === 'Success') {
          setClockStatus(!clockStatus);
        } else {
          Toast.show('Đã xảy ra lỗi, vui lòng thử lại', {
            position: 0,
            duration: 2500,
          });
        }
      })
      .catch(err => {
        console.log(err);
        Toast.show('Đã xảy ra lỗi, vui lòng thử lại', {
          position: 0,
          duration: 2500,
        });
      });
  };

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerText}>Điều khiển Led Matrix</Text>
      </View>
      <Text style={styles.inputTitle}>Nhập IP ESP8266 Led Matrix</Text>
      <View style={styles.inputCont}>
        <View style={{flexDirection: 'row'}}>
          <Text
            style={{
              color: '#666666',
              marginLeft: 10,
              fontSize: 14,
              marginTop: 11,
            }}>
            192.168.1.
          </Text>
          <TextInput
            style={styles.input}
            onChangeText={text => setIp(text)}
            value={ip}
            keyboardType="numeric"
            maxLength={3}
            placeholder="IP"
            underlineColorAndroid="transparent"
            autoCapitalize="none"
            onSubmitEditing={event => {
              checkIp();
            }}
          />
        </View>
        <TouchableOpacity onPress={() => checkIp()}>
          <Image style={styles.inputImage} source={saveIcon} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.swichCont}
        onPress={() => swichClock(clockStatus ? 0 : 1)}>
        <Text style={styles.swichText}>Hình ảnh</Text>
        <Image
          style={styles.swichImg}
          source={clockStatus ? swichRight : swichLeft}
        />
        <Text style={styles.swichText}>Đồng hồ</Text>
      </TouchableOpacity>

      {clockStatus ? (
        <View style={styles.menuCont}>
          <TouchableOpacity
            style={styles.itemMenu}
            onPress={() => goToNextScreen('clock')}>
            <Image style={styles.itemMenuImg} source={clockIcon} />
            <Text>Đồng hồ</Text>
          </TouchableOpacity>
        </View>
      ) : (
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
      )}
    </View>
  );
}

const {width, height} = Dimensions.get('window');
const styles = StyleSheet.create({
  swichCont: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
    marginHorizontal: width / 5,
    borderColor: '#8a8a8a',
    borderRadius: 5,
    borderWidth: 1,
  },
  swichText: {
    fontSize: 16,
  },
  swichImg: {
    width: width / 10,
    height: width / 10,
    marginHorizontal: 10,
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
    width: width / 1.95,
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
    width: width / 10,
    padding: 0,
    paddingLeft: 1,
  },
});
