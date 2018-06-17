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

  getUserStats(id);
}
