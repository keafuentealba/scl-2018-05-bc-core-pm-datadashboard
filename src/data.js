const extractCohortsIds = () => {
  return fetch('../data/cohorts.json')//llamamos json
  .then((response) => {//promesa
    return response.json();//retorna respuesta de fetch
  })
  .then((cohorts) =>{//
    const ids = cohorts.map((cohort) => {
      return cohort.id
    });

    return ids
  });
}

const getUserStats = (cohortId) => {
  console.log(cohortId);
  Promise.all([
    fetch('../data/cohorts.json'),
    fetch('../data/cohorts/' + cohortId + '/progress.json'),
    fetch('../data/cohorts/' + cohortId + '/users.json')
  ]).then((responses)=>{
    return Promise.all(responses.map((response)=>{
      return response.json();
    }));
  }).then((responses) => {
    let users = responses[2];
    let progress = responses[1];
    let cohorts = responses[0].filter((cohort) => {
      return cohort.id === cohortId;
    });
    coursesId = Object.keys(cohorts[0].coursesIndex);
    result = computeUsersStats(users, progress, coursesId)
    sortUsers(result, 'name', 'DESC');
  }).catch((e) => {
    console.log(e);
    console.log('cohort no encontrado');
  });
}

window.computeUsersStats = (users, progress, courses) => {
  for(let i = 0; i < users.length; i++){ //recorre usuarios
    const user_progress = progress[users[i].id]; //obtiene progres para cada usuario
    let courses_progress = Object.keys(user_progress).map((key) => { //obtiene el progreso de cada curso
      return user_progress[key];
    });

    let parts = [];
    courses_progress.forEach((course) => { //itera por el progreso de cada curso
      const parts_aux = Object.keys(course.units).map((key) => { // aplanar parts
        return Object.keys(course.units[key].parts).map((key_parts) => {
          return course.units[key].parts[key_parts]
        });
      });
      parts = parts.concat.apply([], parts_aux);
    });

    let exercises = [];
    const exercisesObject = parts.filter((part) => {return part.type === 'practice'})
      .filter(practice => practice.exercises !== undefined)
      .map(practice => practice.exercises);
    exercisesObject.forEach((exercise) => {
      const exercises_aux = Object.keys(exercise).map((key) => {
        return exercise[key];
      });
      exercises = exercises.concat.apply([], exercises_aux);
    }); //retorna array con parts tipo practice (exercises)
    const reads = parts.filter((part) => {return part.type === 'read'});//retorna array con parts tipo read
    const quizzes = parts.filter((part) => {return part.type === 'quiz'});//retorna array con parts tipo quiz

    users[i].stats = { //le asigna a el usuario un objeto llamado stats
      exercises: {
        total: exercises.length, //total de exercises
        completed: exercises.filter(excercise => excercise.completed === 1).length //filtra solo exercises completados y los cuenta
      },
      reads: {
        total: reads.length, //total reads
        completed: reads.filter(read => read.completed === 1).length //cuenta solo reads completados
      },
      quizzes: {
        total: quizzes.length, //total quiz
        completed: quizzes.filter(quiz => quiz.completed === 1).length, //cuenta solo quiz completados
        scoreSum: quizzes.reduce((previous, current) => { //sumatoria de puntaje (score)
          let score = 0;
          if(current.score !== undefined){
            score = current.score;
          }
          return previous + score}, 0),
      }
    };

    users[i].stats.exercises.percent = Math.round(users[i].stats.exercises.completed / users[i].stats.exercises.total * 100);
    users[i].stats.reads.percent = Math.round(users[i].stats.reads.completed / users[i].stats.reads.total * 100);
    users[i].stats.quizzes.percent = Math.round(users[i].stats.quizzes.completed / users[i].stats.quizzes.total * 100);
    users[i].stats.quizzes.scoreAvg = Math.round(users[i].stats.quizzes.scoreSum / users[i].stats.quizzes.completed)
    users[i].stats.percent = courses_progress.reduce((previous, current) => { //recorre cada progreso de curso y calcula su procentaje
      return previous + current.percent;
    }, 0) / courses.length
  }

  return users;
}

window.sortUsers = (users, orderBy, orderDirection) => {
  users.sort((a, b) => {
    const aValue = a[orderBy].toLowerCase();
    const bValue = b[orderBy].toLowerCase();
    if(aValue > bValue){
      return 1;
    }
    if(aValue < bValue){
      return -1;
    }
    return 0;
  });

  if(orderDirection === 'DESC'){
    users = users.reverse();
  }

  console.log(users);
  return users
}
