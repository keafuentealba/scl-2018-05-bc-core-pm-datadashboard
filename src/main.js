window.onload = () => {//funcion que se ejecuta cuando carga la venta
  extractCohortsIds()
  .then((ids) =>{
    let select = document.getElementById('cohort');

    for( let i = 0; i < ids.length; i++){
      let option = document.createElement('option');
      option.value = ids[i];
      option.innerHTML = ids[i];

      select.appendChild(option);
    }
  });

}
window.executeStats = () => {
  let id = document.getElementById('cohort').value;
  let orderBy = document.getElementById('orderBy').value;
  let orderDirection = document.getElementById('order').value.toUpperCase();
  let filter = document.getElementById('filter').value;


  getUserStats(id, orderBy, orderDirection, filter)
  .then((users) => {
    let userList = document.getElementById('users');
    userList.innerHTML = '';

    for(let i = 0; i < users.length; i++){
      let userRow = document.createElement('div');
      userRow.classList.add('row');

      if(i % 2 === 0){
        userRow.classList.add('even');
      }

      let userName = document.createElement('div');
      userName.classList.add('col-md-2');
      userName.innerHTML = users[i]['name'];
      userRow.appendChild(userName);

      let totalPercent = document.createElement('div');
      totalPercent.classList.add('col-md-2');
      totalPercent.innerHTML = users[i]['stats']['percent'];
      userRow.appendChild(totalPercent);

      let percentExercise = document.createElement('div');
      percentExercise.classList.add('col-md-2');
      percentExercise.innerHTML = users[i]['stats']['exercises']['percent'];
      userRow.appendChild(percentExercise)

      let quizzAverage = document.createElement('div');
      quizzAverage.classList.add('col-md-2');
      quizzAverage.innerHTML = users[i]['stats']['quizzes']['scoreAvg'];
      userRow.appendChild(quizzAverage)

      let percentQuizz = document.createElement('div');
      percentQuizz.classList.add('col-md-2');
      percentQuizz.innerHTML = users[i]['stats']['quizzes']['percent'];
      userRow.appendChild(percentQuizz)

      let readComplete = document.createElement('div');
      readComplete.classList.add('col-md-2');
      readComplete.innerHTML = users[i]['stats']['reads']['completed'];
      userRow.appendChild(readComplete)

      userList.appendChild(userRow);
    }
  });
}
