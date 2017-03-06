import * as preact from 'preact';

class Greeting extends preact.Component<{}, {}> {
    render() {
        return <p>hey</p>;
    }
}

preact.render(<Greeting />, document.body);
