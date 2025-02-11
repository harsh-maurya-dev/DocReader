import { ToastContainer } from 'react-toastify'
import UploadFile from './components/UploadFile'
import './index.css'

function App() {

  return (
    <>
    <ToastContainer autoClose={1000}/>
    <UploadFile/>
    </>
  )
}

export default App
