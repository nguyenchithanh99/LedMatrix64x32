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
        navigation.navigate('Image', {ip: ip});
      } else if (type === 'paint') {
        navigation.navigate('Paint', {ip: ip});
      } else {
        navigation.navigate('Clock', {ip: ip});
      }
    }
  };

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
