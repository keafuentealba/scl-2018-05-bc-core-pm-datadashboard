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
    console.log(users, progress,cohorts);
  }).catch((e) => {
    console.log(e);
    console.log('cohort no encontrado');
  });
}

window.computeUsersStats = (users, progress, courses) => {

}
