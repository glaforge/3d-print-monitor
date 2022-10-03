package printmonitor

import io.micronaut.runtime.EmbeddedApplication
import io.micronaut.test.extensions.spock.annotation.MicronautTest
import spock.lang.Specification
import jakarta.inject.Inject

@MicronautTest
class PrintMonitorSpec extends Specification {

    @Inject
    EmbeddedApplication<?> application

    void 'test it works'() {
        expect:
        application.running
    }

    void 'check different types of messages'() {
        when:
        def broadcastMsg = new Message("broadcast")
        def watcherMsg = new Message("watcher")
        def watcherWithIdMsg = new Message("watcher", "abcd1234")
        def candidateMsg = new Message("candidate", "xyz789", "description")

        then:
        broadcastMsg.type() == "broadcast"

        watcherMsg.type() == "watcher"

        watcherWithIdMsg.type() == "watcher"
        watcherWithIdMsg.id() == "abcd1234"

        candidateMsg.type() == "candidate"
        candidateMsg.id() == "xyz789"
        candidateMsg.description() == "description"
    }

}
