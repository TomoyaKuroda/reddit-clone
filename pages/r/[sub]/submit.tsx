import 'react-quill/dist/quill.snow.css'
import { useState } from 'react'

const ReactQuill = typeof window === 'object' ? require('react-quill') : () => false;

const modules = {
    toolbar: [
        ['bold', 'italic'],
        ['link', 'blockquote', 'code', 'image'],
        [
            { list: 'ordered' },
            { list: 'bullet' }
        ]
    ]
}
export default function Submit() {
    const [reactQuillText, setReactQuillText] = useState('')
    const [title, setTitle] = useState('')
    return (
        <div className='container'>
            <form>
                <label htmlFor='title'>Title</label>
                <input id='title' className='' type='text' value={title} onChange={e => setTitle(e.target.value)} />
                <ReactQuill value={reactQuillText} onChange={value => setReactQuillText(value)}
                    theme='snow'
                    className='w-100'
                    modules={modules}
                />
                <button className='btn btn-primary'>Post</button>
                <button className='btn btn-primary ms-4'>Abort</button>
            </form>
        </div>
    )
}
part 15
1: 54