export const  formatDateDMY = (dateValue)=>{
    if (!dateValue) return "N/A";
    const date = new Date(dateValue);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

