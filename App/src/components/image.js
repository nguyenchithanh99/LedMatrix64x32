import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import GetPixelColor from 'react-native-get-pixel-color';
import Toast from 'react-native-root-toast';

import backIcon from '../icons/back.png';
import cameraIcon from '../icons/camera.png';
import galleryIcon from '../icons/gallery.png';
import sendIcon from '../icons/send.png';

export default function image({navigation, route}) {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  var arr = [];
  for (let i = 0; i < 2048; i++) {
    arr[i] = 0;
  }

  const onButtonInputPress = React.useCallback((type, options) => {
    if (type === 'capture') {
      ImagePicker.launchCamera(options, response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        } else {
          setResponse(response);
        }
      });
    } else {
      ImagePicker.launchImageLibrary(options, response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        } else {
          setResponse(response);
        }
      });
    }
  }, []);

  const options = {
    mediaType: 'photo',
    includeBase64: true,
    maxWidth: 64,
    maxHeight: 32,
    selectionLimit: 1,
    rotation: 270,
  };

  const convertImageToRgb565 = async (base64, height, width) => {
    setLoading(true);
    GetPixelColor.setImage(base64);

    if (height < 32 && width < 64) {
      for (let i = 0; i < 32; i++) {
        for (let j = 0; j < 64; j++) {
          if (j === 63 && i === 31) {
            if (i >= height || j >= width) {
              arr[i * 64 + j] = 0;
              sendImage();
            } else {
              await GetPixelColor.pickColorAt(i, Math.abs(j - width + 1)).then(
                color => {
                  arr[i * 64 + j] = rgb888ToRgb565(color);
                  sendImage();
                },
              );
            }
          } else {
            if (i >= height || j >= width) {
              arr[i * 64 + j] = 0;
            } else {
              await GetPixelColor.pickColorAt(i, Math.abs(j - width + 1)).then(
                color => {
                  arr[i * 64 + j] = rgb888ToRgb565(color);
                },
              );
            }
          }
        }
      }
    } else if (height < 32) {
      for (let i = 0; i < 32; i++) {
        for (let j = 0; j < 64; j++) {
          if (j === 63 && i === 31) {
            if (i >= height) {
              arr[i * 64 + j] = 0;
              sendImage();
            } else {
              await GetPixelColor.pickColorAt(i, Math.abs(j - 63)).then(
                color => {
                  arr[i * 64 + j] = rgb888ToRgb565(color);
                  sendImage();
                },
              );
            }
          } else {
            if (i >= height) {
              arr[i * 64 + j] = 0;
            } else {
              await GetPixelColor.pickColorAt(i, Math.abs(j - 63)).then(
                color => {
                  arr[i * 64 + j] = rgb888ToRgb565(color);
                },
              );
            }
          }
        }
      }
    } else if (width < 64) {
      for (let i = 0; i < 32; i++) {
        for (let j = 0; j < 64; j++) {
          if (j === 63 && i === 31) {
            if (j >= width) {
              arr[i * 64 + j] = 0;
              sendImage();
            } else {
              await GetPixelColor.pickColorAt(i, Math.abs(j - width + 1)).then(
                color => {
                  arr[i * 64 + j] = rgb888ToRgb565(color);
                  sendImage();
                },
              );
            }
          } else {
            if (j >= width) {
              arr[i * 64 + j] = 0;
            } else {
              await GetPixelColor.pickColorAt(i, Math.abs(j - width + 1)).then(
                color => {
                  arr[i * 64 + j] = rgb888ToRgb565(color);
                },
              );
            }
          }
        }
      }
    } else {
      for (let i = 0; i < 32; i++) {
        for (let j = 0; j < 64; j++) {
          if (j === 63 && i === 31) {
            await GetPixelColor.pickColorAt(i, Math.abs(j - 63)).then(color => {
              arr[i * 64 + j] = rgb888ToRgb565(color);
              sendImage();
            });
          } else {
            await GetPixelColor.pickColorAt(i, Math.abs(j - 63)).then(color => {
              arr[i * 64 + j] = rgb888ToRgb565(color);
            });
          }
        }
      }
    }
  };

  const rgb888ToRgb565 = color => {
    var rgb565 =
      ((hexToRgb(color).r & 0xf8) << 8) +
      ((hexToRgb(color).g & 0xfc) << 3) +
      (hexToRgb(color).b >> 3);
    return rgb565;
  };

  const hexToRgb = hex => {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const sendImage = async () => {
    await fetch('http://' + route.params.ip + '/arr', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        arr: arr,
      }),
    })
      .then(response => response.json())
      .then(response => {
        if (response.res === 'Success') {
          setLoading(false);
          Toast.show('Gửi ảnh thành công', {
            position: 0,
            duration: 1500,
          });
        } else {
          setLoading(false);
          Toast.show('Gửi ảnh không thành công, vui lòng thử lại', {
            position: 0,
            duration: 2500,
          });
        }
      })
      .catch(err => {
        setLoading(false);
        console.log(err);
        Toast.show('Gửi ảnh không thành công, vui lòng thử lại', {
          position: 0,
          duration: 2500,
        });
      });
  };

  const Loading = (
    <View style={[styles.buttonCont, {width: width / 4.7, marginRight: 10}]}>
      <Text style={styles.buttonText}>Gửi</Text>
      <ActivityIndicator animating={loading} color="white" size="small" />
    </View>
  );

  return (
    <View>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconCont}
          onPress={() => navigation.goBack()}>
          <Image style={styles.headerIcon} source={backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Chức năng gửi Hình ảnh</Text>
      </View>

      <View style={styles.titleCont}>
        <Text style={styles.title}>Chụp ảnh hoặc chọn ảnh từ thư viện</Text>
        <Text style={styles.description}>
          Vui lòng chụp/chọn ảnh ngang để tối ưu hiển thị
        </Text>
      </View>
      <View style={styles.inputCont}>
        <TouchableOpacity
          style={styles.buttonCont}
          onPress={() => onButtonInputPress('capture', options)}>
          <Text style={styles.buttonText}>Máy ảnh</Text>
          <Image style={styles.buttonImg} source={cameraIcon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonCont}
          onPress={() => onButtonInputPress('gallery', options)}>
          <Text style={styles.buttonText}>Thư viện</Text>
          <Image style={styles.buttonImg} source={galleryIcon} />
        </TouchableOpacity>
      </View>

      {response !== null ? (
        <View style={{marginTop: 20}}>
          <Text style={styles.titleImg}>
            Hình ảnh sẽ hiển thị lên led matrix
          </Text>
          <View style={[styles.inputCont, {padding: 20, height: width / 2}]}>
            <Image
              resizeMode="cover"
              resizeMethod="scale"
              style={styles.image}
              source={{uri: response.uri}}
            />
          </View>
          <View style={{width, alignItems: 'flex-end'}}>
            {loading ? (
              Loading
            ) : (
              <TouchableOpacity
                style={[
                  styles.buttonCont,
                  {width: width / 4.7, marginRight: 10},
                ]}
                onPress={() => {
                  convertImageToRgb565(
                    response.data,
                    response.width,
                    response.height,
                  );
                }}>
                <Text style={styles.buttonText}>Gửi</Text>
                <Image style={styles.buttonImg} source={sendIcon} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const {width, height} = Dimensions.get('window');
const styles = StyleSheet.create({
  titleImg: {
    width: width / 1.68,
    marginLeft: 15,
    marginBottom: -9,
    backgroundColor: '#f2f2f2',
    zIndex: 1,
    color: '#ba562f',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  image: {
    height: width - 80,
    width: width / 2 - 40,
    transform: [{rotate: '90deg'}],
  },
  buttonCont: {
    flexDirection: 'row',
    backgroundColor: '#ba562f',
    borderColor: '#8a8a8a',
    borderRadius: 5,
    borderWidth: 1,
    padding: 5,
    paddingHorizontal: 16,
    marginTop: 20,
    justifyContent: 'space-around',
  },
  buttonText: {
    color: 'white',
    marginRight: 10,
  },
  buttonImg: {
    width: width / 22,
    height: width / 22,
  },
  inputCont: {
    borderColor: '#8a8a8a',
    borderRadius: 5,
    borderWidth: 1,
    marginLeft: 10,
    width: width - 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: height / 7.5,
  },
  titleCont: {
    marginTop: 15,
    marginLeft: 15,
    marginBottom: -26,
    backgroundColor: '#f2f2f2',
    zIndex: 1,
    width: width / 1.6,
  },
  title: {
    color: '#ba562f',
    fontSize: 14,
    width: width / 1.6,
    textAlign: 'center',
  },
  description: {
    fontSize: 10,
    width: width / 1.4,
    marginLeft: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width,
    height: height / 8,
    backgroundColor: '#ba562f',
    paddingTop: 70,
  },
  headerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
  headerIcon: {
    width: width / 22,
    height: width / 22,
  },
  headerIconCont: {
    borderColor: 'white',
    borderRadius: 3,
    borderWidth: 1,
    marginLeft: 10,
    padding: 3,
  },
});
