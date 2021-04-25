import React from 'react';
import {connect} from 'react-redux';

import {closePopout, goBack, openModal, openPopout, setPage} from '../../store/router/actions';

import {
    Alert,
    Button,
    Div,
    FixedLayout,
    Group,
    Panel,
    PanelHeader,
    Snackbar
} from "@vkontakte/vkui";

import Icon16ErrorCircleFill from '@vkontakte/icons/dist/16/error_circle_fill';
import Icon20CheckCircleFillGreen from '@vkontakte/icons/dist/20/check_circle_fill_green';
import { Icon24Pause, Icon24Play, Icon24Replay } from '@vkontakte/icons';
import bridge from '@vkontakte/vk-bridge';

var flashlight = [false, false, false, false, false, false, false, false];

var interval;

class HomePanelBase extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            snackbar: null,
            active: false,
            activeFlashlight: -1,
            flashlight: false
        };

        this.showError = this.showError.bind(this);
        this.showSuccess = this.showSuccess.bind(this);
    }

    showError(text) {
        if (this.state.snackbar) return;
        this.setState({ snackbar:
        <Snackbar
            layout="vertical"
            onClose={() => this.setState({ snackbar: null })}
            before={<Icon16ErrorCircleFill width={24} height={24} />}
        >
            {text}
        </Snackbar>
        });
    }

    showSuccess(text) {
        if (this.state.snackbar) return;
        this.setState({ snackbar:
        <Snackbar
            layout="vertical"
            onClose={() => this.setState({ snackbar: null })}
            before={<Icon20CheckCircleFillGreen width={24} height={24} />}
        >
            {text}
        </Snackbar>
        });
    }

    startTimer() {
        if(this.state.active) {
            clearInterval(interval);
            bridge.send("VKWebAppFlashSetLevel", {"level": 0});
        }
        else {
            if(this.state.activeFlashlight === -1) {
                this.setState({
                    activeFlashlight: 0
                });
                if(flashlight[0] && this.state.flashlight !== true) {//включаем фонарик
                    this.setState({
                        flashlight: true
                    });
                    console.log("Включаем фонарик");
                    bridge.send("VKWebAppFlashSetLevel", {"level": 1});
                }
            }
            interval = setInterval(() => {
                this.setState({
                    activeFlashlight: this.state.activeFlashlight + 1
                })
                if(flashlight[this.state.activeFlashlight] === undefined) {
                    this.setState({
                        activeFlashlight: 0
                    });
                }
                this.forceUpdate();
                if(flashlight[this.state.activeFlashlight] === true) {
                    if(this.state.flashlight !== true) {//включаем фонарик
                        this.setState({
                            flashlight: true
                        });
                        console.log("Включаем фонарик");
                        bridge.send("VKWebAppFlashSetLevel", {"level": 1});
                    }
                } else if(flashlight[this.state.activeFlashlight] === false) {
                    if(this.state.flashlight !== false) {//выключаем фонарик
                        this.setState({
                            flashlight: false
                        });
                        bridge.send("VKWebAppFlashSetLevel", {"level": 0});
                        console.log("Выключаем фонарик");
                    }
                }
            }, 1000);
        }
        this.setState({
            active: !this.state.active
        });
    }

    componentDidMount() {
    }

    render() {
        const {id} = this.props;

        return (
            <Panel id={id}>
                <PanelHeader>Главная</PanelHeader>
                <Group>
                    <FixedLayout vertical="bottom">
                        <table border="1" borderColor="#4986CC" style={{ width: "100%", borderColor: "#4986CC", borderCollapse: 'collapse' }}>
                            <tbody>
                                <tr>
                                    {flashlight.map((item, index) => 
                                        <td className={this.state.activeFlashlight === index ? 'active' : ''} onClick={() => {
                                            flashlight[index] = !flashlight[index];
                                            this.forceUpdate();
                                        }} style={item ? { backgroundColor: '#4986CC', borderWidth: 2 } : { borderWidth: 2 }}>&nbsp;</td>)
                                    }
                                </tr>
                            </tbody>
                        </table>
                        <Div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Button onClick={() => {
                                    this.startTimer();
                                }} style={{ borderRadius: '50%', height: 50, width: 50 }} size="l">
                                    {this.state.active ? <Icon24Pause/> : <Icon24Play/>}
                                </Button>
                                <Button onClick={() => {
                                    this.props.openPopout(
                                        <Alert
                                            actions={[{
                                                title: 'Отмена',
                                                autoclose: true,
                                                mode: 'cancel'
                                            }, {
                                                title: 'Очистить',
                                                autoclose: true,
                                                mode: 'destructive',
                                                action: () => {
                                                    flashlight = [false, false, false, false, false, false, false, false];
                                                    this.forceUpdate();
                                                },
                                            }]}
                                            actionsLayout="horizontal"
                                            onClose={this.props.closePopout}
                                            header="Подтверждение"
                                            text="Вы уверены, что хотите очистить созданный бит?"
                                        />
                                    );
                                }} style={{ borderRadius: '50%', height: 50, width: 50 }} size="l">
                                    <Icon24Replay/>
                                </Button>
                            </div>
                        </Div>
                    </FixedLayout>
                </Group>
                {this.state.snackbar}
            </Panel>
        );
    }

}

const mapDispatchToProps = {
    setPage,
    goBack,
    openPopout,
    closePopout,
    openModal
};

export default connect(null, mapDispatchToProps)(HomePanelBase);
