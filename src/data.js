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
    computeUsersStats(users, progress, coursesId)
  }).catch((e) => {
    console.log(e);
    console.log('cohort no encontrado');
  });
}

window.computeUsersStats = (users, progress, courses) => {
  console.log(users, progress, courses);
  for(let i = 0; i < users.length; i++){
    const user_progress = progress[users[i].id];
    let total_percent = 0;
    let courses = Object.keys(user_progress).map(key => user_progress[key]);
    console.log(courses);
    let parts = [];
    courses.forEach((course) => {
      const parts_aux = Object.keys(course.units).map((key) => {
        return Object.keys(course.units[key].parts).map((key_parts) => {
          return course.units[key].parts[key_parts]
        });
      });
      parts = parts.concat.apply([], parts_aux);
    });
    const exercises = parts.filter((part) => {return part.type === 'practice'});
    const reads = parts.filter((part) => {return part.type === 'read'});
    const quizzes = parts.filter((part) => {return part.type === 'quiz'});
    users[i].stats = {
      exercises: {
        total: exercises.length,
        completed: exercises.filter(excercise => excercise.completed === 1).length
      },
      reads: {
        total: reads.length,
        completed: reads.filter(read => read.completed === 1).length,
      },
      quizzes: {
        total: quizzes.length,
        completed: quizzes.filter(quiz => quiz.completed === 1).length,
        scoreSum: quizzes.reduce((previous, current) => {
          let score = 0;
          if(current.score !== undefined){
            score = current.score;
          }
          return previous + score}, 0),
      }
    };
    users[i].stats.exercises.percent = parseInt(users[i].stats.exercises.completed / users[i].stats.exercises.total * 100);
    users[i].stats.reads.percent = parseInt(users[i].stats.reads.completed / users[i].stats.reads.total * 100);
    users[i].stats.quizzes.percent = parseInt(users[i].stats.quizzes.completed / users[i].stats.quizzes.total * 100);
    users[i].stats.quizzes.scoreAvg = parseInt(users[i].stats.quizzes.scoreSum / users[i].stats.quizzes.total)
    users[i].stats.percent = courses.reduce((previous, current) => {
      return previous + current.percent;
    }, 0) / courses.length
  }
  console.log(progress["00hJv4mzvqM3D9kBy3dfxoJyFV82"]);
  console.log(users);
}
