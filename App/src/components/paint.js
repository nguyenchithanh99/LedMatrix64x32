import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import React from 'react';
import RNSketchCanvas from '@terrylinla/react-native-sketch-canvas';

import backIcon from '../icons/back.png';

export default function paint({navigation, route}) {
  return (
    <View>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconCont}
          onPress={() => navigation.goBack()}>
          <Image style={styles.headerIcon} source={backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Chức năng Vẽ</Text>
      </View>

      <View style={styles.container}>
        <View style={{flex: 1, flexDirection: 'row'}}>
          <RNSketchCanvas
            containerStyle={styles.containerStyle}
            canvasStyle={styles.canvasStyle}
            defaultStrokeIndex={0}
            defaultStrokeWidth={3}
            undoComponent={
              <View style={styles.functionButton}>
                <Text style={{color: 'white'}}>Undo</Text>
              </View>
            }
            eraseComponent={
              <View style={styles.functionButton}>
                <Text style={{color: 'white'}}>Eraser</Text>
              </View>
            }
            clearComponent={
              <View style={styles.functionButton}>
                <Text style={{color: 'white'}}>Clear</Text>
              </View>
            }
            strokeComponent={color => (
              <View
                style={[{backgroundColor: color}, styles.strokeColorButton]}
              />
            )}
            strokeSelectedComponent={(color, index, changed) => {
              return (
                <View
                  style={[
                    {backgroundColor: color, borderWidth: 2},
                    styles.strokeColorButton,
                  ]}
                />
              );
            }}
            strokeWidthComponent={w => {
              return (
                <View style={styles.strokeWidthButton}>
                  <View
                    style={{
                      backgroundColor: 'white',
                      marginHorizontal: 2.5,
                      width: Math.sqrt(w / 10) * 10,
                      height: Math.sqrt(w / 10) * 10,
                      borderRadius: (Math.sqrt(w / 3) * 10) / 2,
                    }}
                  />
                </View>
              );
            }}
            saveComponent={
              <View style={styles.functionButton}>
                <Text style={{color: 'white'}}>Save</Text>
              </View>
            }
            onSketchSaved={(success, path) => {
              if (success) {
                navigation.navigate('SendImage', {ip: route.params.ip, path});
              }
            }}
            savePreference={() => {
              return {
                folder: 'Pictures',
                filename: String(Math.ceil(Math.random() * 100000000)),
                transparent: true,
                imageType: 'png',
              };
            }}
          />
        </View>
      </View>
    </View>
  );
}

const {width, height} = Dimensions.get('window');
const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: 'transparent',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasStyle: {
    backgroundColor: 'black',
    flex: 1,
    width: width - 125,
  },
  container: {
    width,
    height: height - 65,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  strokeColorButton: {
    marginHorizontal: 2.5,
    marginVertical: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  strokeWidthButton: {
    marginHorizontal: 2.5,
    marginVertical: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ba562f',
  },
  functionButton: {
    marginHorizontal: 2.5,
    marginVertical: 8,
    height: 30,
    width: 60,
    backgroundColor: '#ba562f',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
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
    width: width / 21,
    height: width / 21,
  },
  headerIconCont: {
    borderColor: 'white',
    borderRadius: 3,
    borderWidth: 1,
    marginLeft: 10,
    padding: 3,
  },
});
