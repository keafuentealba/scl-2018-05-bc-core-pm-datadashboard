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

const getUserStats = (cohortId, orderBy, orderDirection, filter) => {
  return Promise.all([
    fetch('../data/cohorts.json'),
    fetch('../data/cohorts/' + cohortId + '/progress.json'),
    fetch('../data/cohorts/' + cohortId + '/users.json')
  ]).then((responses)=>{
    return Promise.all(responses.map((response)=>{
      return response.json();
    }));
  }).then((responses) => {
    let users = responses[2];//asigna respectivas respuestas y ubicacion 
    let progress = responses[1];
    let cohorts = responses[0].filter((cohort) => {
      return cohort.id === cohortId;
    });
    let result = processCohortData({
      cohort: cohorts[0],
      cohortData: {
        users: users,
        progress: progress
      },
      orderBy: orderBy,
      orderDirection: orderDirection,
      search: filter
    });
    return result;

  }).catch((e) => {
    console.log(e);
    console.log('cohort no encontrado');
  });
}

window.computeUsersStats = (users, progress, courses) => {
  for(let i = 0; i < users.length; i++){ //recorre usuarios
    const user_progress = progress[users[i].id]; //obtiene progress para cada usuario
    let courses_progress = Object.keys(user_progress).map((key) => { //obtiene el progreso de cada curso
      return user_progress[key];
    });

    let parts = [];
    courses_progress.forEach((course) => { //itera por el progreso de cada curso  (utilizo forEach para iterar por el arreglo)
      const parts_aux = Object.keys(course.units).map((key) => { // aplanar parts
        return Object.keys(course.units[key].parts).map((key_parts) => {
          return course.units[key].parts[key_parts]
        });
      });
      parts = parts.concat.apply([], parts_aux); //mezcla los array devueltos de parts_aux en el array parts
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

    users[i].stats.exercises.percent = users[i].stats.exercises.total ? Math.round(users[i].stats.exercises.completed / users[i].stats.exercises.total * 100) : 0;
    users[i].stats.reads.percent = users[i].stats.reads.total ? Math.round(users[i].stats.reads.completed / users[i].stats.reads.total * 100) : 0;
    users[i].stats.quizzes.percent = users[i].stats.quizzes.total ? Math.round(users[i].stats.quizzes.completed / users[i].stats.quizzes.total * 100) : 0;
    users[i].stats.quizzes.scoreAvg = users[i].stats.quizzes.completed ? Math.round(users[i].stats.quizzes.scoreSum / users[i].stats.quizzes.completed) : 0;
    users[i].stats.percent = courses_progress.reduce((previous, current) => { //recorre cada progreso de curso y calcula su procentaje
      return previous + current.percent;
    }, 0) / courses.length
  }



  return users;
}

window.sortUsers = (users, orderBy, orderDirection) => {//ordena de forma ascendente
  let result = [];

  if(orderBy === 'name'){
    result = users.sort((a, b) => {
      if(a.name > b.name){
        return 1;
      }
      if(a.name < b.name){
        return -1;
      }
      return 0;
    });
  }

  if(orderBy === 'percentTotal'){//compara la eleccion de select con percent total
    result = users.sort((a, b) => {
      if(a.percent > b.percent){//si 'a' es mayor a 'b' retorna '1'
        return 1;
      }
      if(a.percent < b.percent){//si 'a' es menor 'b' retorna -1'
        return -1;
      }
      return 0;
    });
  }

  if(orderBy === 'percentExercise'){//
    result = users.sort((a, b) => {
      if(a.stats.exercises.percent > b.stats.exercises.percent){
        return 1;
      }
      if(a.stats.exercises.percent < b.stats.exercises.percent){
        return -1;
      }
      return 0;
    });
  }

  if(orderBy === 'percentQuizzes'){
    result = users.sort((a, b) => {
      if(a.stats.quizzes.percent > b.stats.quizzes.percent){
        return 1;
      }
      if(a.stats.quizzes.percent < b.stats.quizzes.percent){
        return -1;
      }
      return 0;
    });
  }

  if(orderBy === 'averageScoreQuizz'){
    result = users.sort((a, b) => {
      if(a.stats.quizzes.scoreAvg > b.stats.quizzes.scoreAvg){
        return 1;
      }
      if(a.stats.quizzes.scoreAvg < b.stats.quizzes.scoreAvg){
        return -1;
      }
      return 0;
    });
  }

  if(orderBy === 'percentReads'){
    result = users.sort((a, b) => {
      if(a.stats.reads.percent > b.stats.reads.percent){
        return 1;
      }
      if(a.stats.reads.percent < b.stats.reads.percent){
        return -1;
      }
      return 0;
    });
  }

  if(orderDirection === 'DESC'){//ordena de forma descendentes
    result = result.reverse();
  }

  return result;
}

window.filterUsers = (users, search) => {// filtra
  return users.filter((user) => {
    return user.name.toLowerCase() === search.toLowerCase();//lleva a minusculas los nombres para filtrar
  });
}

window.processCohortData = (options) => {//funcion que toma la informacion que se le asigna y las llama
  coursesId = Object.keys(options.cohort.coursesIndex);
  let result = computeUsersStats(options.cohortData.users, options.cohortData.progress, coursesId);

  result = sortUsers(result, options.orderBy, options.orderDirection);

  if(options.search !== ''){
    result = filterUsers(result, options.search);
  }

  return result;

}
