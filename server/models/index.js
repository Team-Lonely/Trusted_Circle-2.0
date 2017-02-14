const moment = require('moment');

const sequelize = require('../../db').sequelize;

// var getAllSongsFromTrain = trainId => {
//   return songModel.findAll({
//     where: {
//       trainId: trainId
//     }
//   });
// };

// var getFavoritedTrains = userId => {
//   return userFavModel.findAll({
//     where: {
//       userId: userId
//     }
//   }).then(trains => {
//     return Promise.all(
//       trains.map(train => {
//         return songModel.findAll({
//           where: {
//             trainId: train.dataValues.trainId
//           }
//         }).then(songs => {
//           train.songs = songs.map(song => {
//             return {
//               title: song.title,
//               artist: song.artist,
//               songSourcePath: song.songSourcePath
//             };
//           });
//           return {
//             songs: train.songs,
//             trainName: train.trainName,
//             trainImg: train.trainImg,
//             trainId: train.id
//           };
//         });
//       })
//     );
//   });
// };

// var favTrain = (trainName, trainImg, trainId, userId) => {
//   return userFavModel.create({
//       userId: userId,
//       trainId: trainId,
//       trainImg: trainImg,
//       trainName: trainName
//     });
// };

// var addSong = (track, trainId) => {
//   var mp3path;
//   return util.getHypemSongPath(track)
//     .then(pathToMp3 => {
//       mp3path = pathToMp3;
//       return getAllSongsFromTrain(trainId);
//     }).then(songs => {
//       return songModel.create({
//         title: track.song,
//         artist: track.artist,
//         songSourcePath: mp3path,
//         trainId: trainId,
//         trackNum: songs.length
//       });
//     });
// };

// var addTags = (tags, trainId) => {
//   return Promise.all(
//     tags.map(tag => {
//       return tagModel.create({
//         text: tag
//       }).then(createdTag => {
//         let currDate = moment().format();
//         currDate = currDate.replace('T', ' ').substr(0, currDate.lastIndexOf('-'))
//         return sequelize.query('INSERT INTO TrainTag (trainId, tagId, createdAt, updatedAt) value (?, ?, ?, ?)', {
//           replacements : [trainId.toString(), createdTag.dataValues.id.toString(), currDate, currDate],
//           type: sequelize.QueryTypes.INSERT
//         });
//       });
//     })
//   );
// };

// var getTrainsByTag = tagName => {
//   console.log('tagName', tagName);
//   return tagModel.findAll({
//     where: {
//       text: tagName
//     }
//   }).then(tags => {
//     return Promise.all(
//       tags.map(tag => {
//         let tagId = tag.dataValues.id;
//         let foundTrain;
//         return sequelize.query('SELECT * FROM TrainTag WHERE tagId=' + tagId, {
//           type: sequelize.QueryTypes.SELECT
//         }).then(trainTag => {
//           console.log('trainTag', trainTag);
//           return trainModel.findOne({
//             where: {
//               id: trainTag[0].trainId
//             }
//           });
//         }).then(train => {
//           foundTrain = train;
//           return songModel.findAll({
//             where: {
//               trainId: train.dataValues.id
//             }
//           });
//         }).then(songs => {
//           let mappedTrain = {
//             songs: songs.map(song => {
//               return {
//                 title: song.dataValues.title,
//                 artist: song.dataValues.artist,
//                 songSourcePath: song.dataValues.songSourcePath
//               };
//             }),
//             trainId: foundTrain.dataValues.id,
//             trainName: foundTrain.dataValues.name,
//             trainImg: foundTrain.dataValues.imgUrl
//           };
//           return mappedTrain;
//         });
//       })
//     );
//   });
// };

module.exports = {
  // getAllSongsFromTrain: getAllSongsFromTrain,
  // addTags: addTags,
  // getFavoritedTrains: getFavoritedTrains,
  // favTrain: favTrain,
  // addSong: addSong,
  // getTrainsByTag: getTrainsByTag
};