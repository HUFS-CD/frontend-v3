/*global Tmapv2*/
const AddressList = ({ nameList, select }) => {
  return (
    <>
      {nameList.map((e, i) => (
        <div key={i}>
          {e.name}
          <button onClick={(e) => select(e)}>선택</button>
        </div>
      ))}
    </>
  );
};

export default AddressList;
